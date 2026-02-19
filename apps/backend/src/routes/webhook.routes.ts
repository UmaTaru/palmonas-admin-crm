import { Router } from "express";
import { WebhookController } from "../controller/webhook.controller";
import { webhookAuth } from "../middleware/webhook-auth.middleware";
import { webhookLimiter } from "../middleware/rate-limit.middleware";

const router = Router();
const controller = new WebhookController();

/**
 * @swagger
 * /webhooks/{channel}:
 *   post:
 *     summary: Receive order webhook
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: channel
 *         required: true
 *         schema:
 *           type: string
 */
router.post("/:channel", webhookAuth, webhookLimiter, controller.handleWebhook.bind(controller));

export default router;
