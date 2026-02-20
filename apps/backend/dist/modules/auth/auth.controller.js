"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    message: "Email and password are required",
                });
            }
            const tokens = await authService.login(email, password);
            return res.status(200).json(tokens);
        }
        catch (error) {
            return res.status(401).json({
                message: error instanceof Error ? error.message : "Invalid credentials",
            });
        }
    }
    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({
                    message: "Refresh token is required",
                });
            }
            const newToken = await authService.refresh(refreshToken);
            return res.status(200).json(newToken);
        }
        catch {
            return res.status(401).json({
                message: "Invalid refresh token",
            });
        }
    }
}
exports.AuthController = AuthController;
