import { Request } from "express";
import { OrdersRepository, OrderFilters } from "./orders.repository";
import { pool } from "../../database/pool";
import { AmazonAdapter } from "../integrations/amazon/amazon.adapter";
import { BlinkitAdapter } from "../integrations/blinkit/blinkit.adapter";
import { cacheService } from "../../cache/cache.service";

export class OrdersService {

  private repository = new OrdersRepository();

  async getOrders(filters: OrderFilters) {
    try {
      console.log("🔍 Getting orders with filters:", filters);
      
      // Temporarily bypass cache to debug
      const orders = await this.repository.findAll(filters);
      console.log("✅ Orders fetched from DB:", orders.length, "records");
      
      // Try to cache (but don't fail if cache fails)
      try {
        const cacheKey = `orders:${filters.page}:${filters.limit}:${filters.status}`;
        await cacheService.set(cacheKey, orders, 60 * 60);
        console.log("✅ Orders cached successfully");
      } catch (cacheError) {
        console.error("⚠️ Cache error (continuing anyway):", cacheError);
      }
      
      return orders;
    } catch (error) {
      console.error("❌ Error in getOrders:", error);
      throw error;
    }
  }

  async getOrderById(orderId: string, req: Request) {
    const order = await this.repository.findById(orderId);
    if (!order) throw new Error("Order not found");

    const history = await this.repository.getStatusHistory(orderId);
    req.log.info({
      orderId,
      action: "ORDER_FOUND"
    });
    return { order, history };
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: string,
    userId: number,
    userEmail: string,
    req: Request
  ) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        "SELECT status FROM orders WHERE id = $1",
        [orderId]
      );

      if (rows.length === 0) {
        throw new Error("Order not found");
      }

      const oldStatus = rows[0].status;

      const updated = await this.repository.updateStatus(
        orderId,
        newStatus
      );

      await client.query(
        `
        INSERT INTO order_status_history (
          order_id,
          old_status,
          new_status,
          changed_by,
          changed_by_email
        )
        VALUES ($1,$2,$3,$4,$5)
        `,
        [orderId, oldStatus, newStatus, userId, userEmail]
      );

      await client.query("COMMIT");

      const adapters: Record<string, any> = {
        amazon: AmazonAdapter,
        blinkit: BlinkitAdapter,
      };

      const AdapterClass = adapters[updated.channel];

      if (AdapterClass) {
      try {
        const adapter = new AdapterClass();
        await adapter.updateOrderStatus(
          updated.external_order_id,
          newStatus
        );
      } catch (error: any) {
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

    } catch (error: any) {
      await client.query("ROLLBACK");
      req.log.error({
        error: `[updateOrderStatus] ${error.message}`,
        stack: error.stack,
        orderId
      });
      throw error;
    } finally {
      client.release();
    }
  }
}
