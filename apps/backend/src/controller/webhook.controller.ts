import { Request, Response } from "express";
import { getTransformer } from "../factory/transformer.factory";
import { OrderIngestionService } from "../services/order-ingestion.service";

const ingestionService = new OrderIngestionService();

export class WebhookController {

  async handleWebhook(req: Request, res: Response) {
    try {
      const { channel } = req.params;

      if (!channel) {
        return res.status(400).json({ message: "Channel required" });
      }

      const transformer = getTransformer(`${channel}`);

      const canonicalOrder = transformer.transform(req.body);

      const result = await ingestionService.ingestOrder(canonicalOrder);

      return res.status(200).json({
        message: "Order ingested successfully",
        data: result,
      });

    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Webhook processing failed",
      });
    }
  }
}
