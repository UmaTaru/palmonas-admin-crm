import { Router } from "express";
import { LogsController } from "./logs.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();
const controller = new LogsController();

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get application logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of logs to return
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [all, info, warn, error]
 *           default: all
 *         description: Filter logs by level
 *     responses:
 *       200:
 *         description: List of logs
 */
router.get("/", authMiddleware, controller.getLogs.bind(controller));

export default router;
