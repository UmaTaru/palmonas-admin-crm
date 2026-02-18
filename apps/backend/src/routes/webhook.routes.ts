import { Router } from "express";
import { WebhookController } from "../controller/webhook.controller";

const router = Router();
const controller = new WebhookController();

router.post("/:channel", controller.handleWebhook.bind(controller));

export default router;
