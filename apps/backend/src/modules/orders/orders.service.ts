import { OrdersRepository, OrderFilters } from "./orders.repository";
import { pool } from "../../database/pool";

export class OrdersService {

  private repository = new OrdersRepository();

  async getOrders(filters: OrderFilters) {
    return this.repository.findAll(filters);
  }

  async getOrderById(orderId: string) {
    const order = await this.repository.findById(orderId);
    if (!order) throw new Error("Order not found");

    const history = await this.repository.getStatusHistory(orderId);

    return { order, history };
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: string,
    userId: number,
    userEmail: string
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

      return updated;

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
