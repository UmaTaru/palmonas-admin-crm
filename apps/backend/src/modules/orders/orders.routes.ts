import { Router } from "express";
import { OrdersController } from "./orders.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();
const controller = new OrdersController();

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get("/", authMiddleware, controller.getOrders.bind(controller));
router.get("/:id", authMiddleware, controller.getOrderById.bind(controller));
/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.patch("/:id/status", authMiddleware, controller.updateStatus.bind(controller));

export default router;
