"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersRepository = void 0;
const pool_1 = require("../../database/pool");
class OrdersRepository {
    async findAll(filters) {
        const { page = 1, limit = 10, status, channel, search, } = filters;
        const offset = (page - 1) * limit;
        const values = [];
        let conditions = [];
        let idx = 1;
        if (status) {
            conditions.push(`status = $${idx++}`);
            values.push(status);
        }
        if (channel) {
            conditions.push(`channel = $${idx++}`);
            values.push(channel);
        }
        if (search) {
            conditions.push(`(external_order_id ILIKE $${idx} OR customer_email ILIKE $${idx})`);
            values.push(`%${search}%`);
            idx++;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const query = `
      SELECT *
      FROM orders
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${idx++}
      OFFSET $${idx}
    `;
        values.push(limit);
        values.push(offset);
        const { rows } = await pool_1.pool.query(query, values);
        return rows;
    }
    async findById(orderId) {
        const { rows } = await pool_1.pool.query("SELECT * FROM orders WHERE id = $1", [orderId]);
        return rows[0];
    }
    async updateStatus(orderId, newStatus) {
        const { rows } = await pool_1.pool.query(`
    UPDATE orders
    SET status = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `, [newStatus, orderId]);
        return rows[0];
    }
    async getStatusHistory(orderId) {
        const { rows } = await pool_1.pool.query(`
      SELECT *
      FROM order_status_history
      WHERE order_id = $1
      ORDER BY changed_at DESC
      `, [orderId]);
        return rows;
    }
}
exports.OrdersRepository = OrdersRepository;
