"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderIngestionService = void 0;
const pool_1 = require("../database/pool");
class OrderIngestionService {
    async ingestOrder(orderData) {
        const client = await pool_1.pool.connect();
        try {
            await client.query("BEGIN");
            const { rows: existing } = await client.query(`
        SELECT id FROM orders
        WHERE external_order_id = $1 AND channel = $2
        `, [orderData.external_order_id, orderData.channel]);
            if (existing.length > 0) {
                await client.query("ROLLBACK");
                return { message: "Order already exists" };
            }
            const orderNumber = this.generateRandomTenDigitNumber();
            const { rows } = await client.query(`
        INSERT INTO orders (
          external_order_id,
          order_number,
          channel,
          customer_email,
          customer_name,
          customer_address,
          customer_city,
          customer_state,
          status,
          total_amount,
          promo_code,
          payment_mode,
          balance_payment
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING *
        `, [
                orderData.external_order_id,
                orderNumber,
                orderData.channel,
                orderData.customer_email,
                orderData.customer_name,
                orderData.customer_address,
                orderData.customer_city,
                orderData.customer_state,
                orderData.status,
                orderData.total_amount,
                orderData.promo_code,
                orderData.payment_mode,
                orderData.balance_payment,
            ]);
            const createdOrder = rows[0];
            if (orderData.items && Array.isArray(orderData.items)) {
                for (const item of orderData.items) {
                    await client.query(`
            INSERT INTO order_items (
              order_id,
              product_id,
              product_name,
              price,
              quantity
            )
            VALUES ($1,$2,$3,$4,$5)
            `, [
                        createdOrder.id,
                        item.product_id,
                        item.product_name,
                        item.price,
                        item.quantity,
                    ]);
                }
            }
            await client.query(`
        INSERT INTO order_status_history (
          order_id,
          old_status,
          new_status,
          changed_by,
          changed_by_email
        )
        VALUES ($1, $2, $3, $4, $5)
        `, [
                createdOrder.id,
                null,
                orderData.status,
                null,
                null,
            ]);
            await client.query("COMMIT");
            return createdOrder;
        }
        catch (error) {
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            client.release();
        }
    }
    generateRandomTenDigitNumber() {
        const min = 1000000000;
        const max = 9999999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
exports.OrderIngestionService = OrderIngestionService;
