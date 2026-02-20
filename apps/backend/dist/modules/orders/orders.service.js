"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const orders_repository_1 = require("./orders.repository");
const pool_1 = require("../../database/pool");
const amazon_adapter_1 = require("../integrations/amazon/amazon.adapter");
const blinkit_adapter_1 = require("../integrations/blinkit/blinkit.adapter");
const cache_service_1 = require("../../cache/cache.service");
class OrdersService {
    constructor() {
        this.repository = new orders_repository_1.OrdersRepository();
    }
    async getOrders(filters) {
        try {
            console.log("🔍 Getting orders with filters:", filters);
            const orders = await this.repository.findAll(filters);
            console.log("✅ Orders fetched from DB:", orders.length, "records");
            try {
                const cacheKey = `orders:${filters.page}:${filters.limit}:${filters.status}`;
                await cache_service_1.cacheService.set(cacheKey, orders, 60 * 60);
                console.log("✅ Orders cached successfully");
            }
            catch (cacheError) {
                console.error("⚠️ Cache error (continuing anyway):", cacheError);
            }
            return orders;
        }
        catch (error) {
            console.error("❌ Error in getOrders:", error);
            throw error;
        }
    }
    async getOrderById(orderId, req) {
        const order = await this.repository.findById(orderId);
        if (!order)
            throw new Error("Order not found");
        const history = await this.repository.getStatusHistory(orderId);
        req.log.info({
            orderId,
            action: "ORDER_FOUND"
        });
        return { order, history };
    }
    async updateOrderStatus(orderId, newStatus, userId, userEmail, req) {
        const client = await pool_1.pool.connect();
        try {
            await client.query("BEGIN");
            const { rows } = await client.query("SELECT status FROM orders WHERE id = $1", [orderId]);
            if (rows.length === 0) {
                throw new Error("Order not found");
            }
            const oldStatus = rows[0].status;
            const updated = await this.repository.updateStatus(orderId, newStatus);
            await client.query(`
        INSERT INTO order_status_history (
          order_id,
          old_status,
          new_status,
          changed_by,
          changed_by_email
        )
        VALUES ($1,$2,$3,$4,$5)
        `, [orderId, oldStatus, newStatus, userId, userEmail]);
            await client.query("COMMIT");
            const adapters = {
                amazon: amazon_adapter_1.AmazonAdapter,
                blinkit: blinkit_adapter_1.BlinkitAdapter,
            };
            const AdapterClass = adapters[updated.channel];
            if (AdapterClass) {
                try {
                    const adapter = new AdapterClass();
                    await adapter.updateOrderStatus(updated.external_order_id, newStatus);
                }
                catch (error) {
                    req.log.error({
                        error: `[updateOrderStatus][${updated.channel}] ${error.message}`,
                        stack: error.stack,
                        orderId
                    });
                }
            }
            req.log.info({
                orderId,
                action: "ORDER_UPDATED",
                oldStatus,
                newStatus,
                userEmail
            });
            return updated;
        }
        catch (error) {
            await client.query("ROLLBACK");
            req.log.error({
                error: `[updateOrderStatus] ${error.message}`,
                stack: error.stack,
                orderId
            });
            throw error;
        }
        finally {
            client.release();
        }
    }
}
exports.OrdersService = OrdersService;
