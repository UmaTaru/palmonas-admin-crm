import { Request, Response } from "express";
import { LogsService } from "./logs.service";

const service = new LogsService();

export class LogsController {
  async getLogs(req: Request, res: Response) {
    try {
      const { limit = 100, level } = req.query;
      const logs = await service.getLogs({
        limit: parseInt(limit as string),
        level: level as string
      });
      
      return res.status(200).json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      return res.status(500).json({ message: "Failed to fetch logs" });
    }
  }
}
