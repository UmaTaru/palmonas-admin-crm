"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const orders_service_1 = require("./orders.service");
const service = new orders_service_1.OrdersService();
class OrdersController {
    async getOrders(req, res) {
        try {
            const orders = await service.getOrders(req.query);
            return res.status(200).json(orders);
        }
        catch {
            return res.status(500).json({ message: "Failed to fetch orders" });
        }
    }
    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const result = await service.getOrderById(`${id}`, req);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(404).json({ message: error.message });
        }
    }
    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const { id } = req.params;
            if (!status) {
                return res.status(400).json({ message: "Status required" });
            }
            const updated = await service.updateOrderStatus(`${id}`, status, req.user.userId, req.user.email, req);
            return res.status(200).json(updated);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}
exports.OrdersController = OrdersController;
