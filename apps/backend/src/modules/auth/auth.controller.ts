import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      const tokens = await authService.login(email, password);

      return res.status(200).json(tokens);
    } catch (error) {
      return res.status(401).json({
        message: error instanceof Error ? error.message : "Invalid credentials",
      });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          message: "Refresh token is required",
        });
      }

      const newToken = await authService.refresh(refreshToken);

      return res.status(200).json(newToken);
    } catch {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }
  }
}
