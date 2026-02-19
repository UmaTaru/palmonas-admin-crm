import { Router } from "express";
import { OrdersController } from "./orders.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();
const controller = new OrdersController();

router.get("/", authMiddleware, controller.getOrders.bind(controller));
router.get("/:id", authMiddleware, controller.getOrderById.bind(controller));
router.patch("/:id/status", authMiddleware, controller.updateStatus.bind(controller));

export default router;
