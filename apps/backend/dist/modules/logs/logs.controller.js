"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsController = void 0;
const logs_service_1 = require("./logs.service");
const service = new logs_service_1.LogsService();
class LogsController {
    async getLogs(req, res) {
        try {
            const { limit = 100, level } = req.query;
            const logs = await service.getLogs({
                limit: parseInt(limit),
                level: level
            });
            return res.status(200).json(logs);
        }
        catch (error) {
            console.error("Error fetching logs:", error);
            return res.status(500).json({ message: "Failed to fetch logs" });
        }
    }
}
exports.LogsController = LogsController;
