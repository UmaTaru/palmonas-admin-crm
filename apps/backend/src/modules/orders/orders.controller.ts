import { Request, Response } from "express";
import { OrdersService } from "./orders.service";

interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

const service = new OrdersService();

export class OrdersController {

  async getOrders(req: Request, res: Response) {
    try {
      const orders = await service.getOrders(req.query as any);
      
      return res.status(200).json(orders);
    } catch {
      return res.status(500).json({ message: "Failed to fetch orders" });
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await service.getOrderById(`${id}`, req);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      const { id } = req.params;

      if (!status) {
        return res.status(400).json({ message: "Status required" });
      }

      const updated = await service.updateOrderStatus(
        `${id}`,
        status,
        req.user!.userId,
        req.user!.email,
        req
      );

      return res.status(200).json(updated);

    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
