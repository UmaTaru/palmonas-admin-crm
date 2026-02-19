import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authLimiter } from "../../middleware/rate-limit.middleware";

const router = Router();
const controller = new AuthController();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login",authLimiter, (req, res) => controller.login(req, res));
router.post("/refresh", (req, res) => controller.refresh(req, res));

export default router;
