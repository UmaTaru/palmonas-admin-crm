"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const transformer_factory_1 = require("../factory/transformer.factory");
const order_ingestion_service_1 = require("../services/order-ingestion.service");
const ingestionService = new order_ingestion_service_1.OrderIngestionService();
class WebhookController {
    async handleWebhook(req, res) {
        try {
            const { channel } = req.params;
            if (!channel) {
                return res.status(400).json({ message: "Channel required" });
            }
            const transformer = (0, transformer_factory_1.getTransformer)(`${channel}`);
            const canonicalOrder = transformer.transform(req.body, req);
            const result = await ingestionService.ingestOrder(canonicalOrder);
            return res.status(200).json({
                message: "Order ingested successfully",
                data: result,
            });
        }
        catch (error) {
            req.log.error({
                error: `[handleWebhook][${req.params.channel}] ${error.message}`,
                stack: error.stack
            });
            return res.status(400).json({
                message: error.message || "Webhook processing failed",
            });
        }
    }
}
exports.WebhookController = WebhookController;
