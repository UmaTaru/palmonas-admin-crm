import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import pino from "pino";
import authRoutes from "./modules/auth/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { authorize } from "./middleware/access_control.middleware";
import webhookRoutes from "./routes/webhook.routes";
import ordersRoutes from "./modules/orders/orders.routes";
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import { pool } from "./database/pool";
import { sanitizeBody } from "./utils/logger";

const app = express();

app.use(requestIdMiddleware);

// Logger
const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({
      requestId: (req as any).requestId,
      body:
        req.method !== "GET"
          ? sanitizeBody(req.body)
          : undefined,
    }),
  })
);



// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());

app.get(
  "/admin-only",
  authMiddleware,
  authorize("SUPER_ADMIN"),
  (req, res) => {
    res.json({ message: "Admin access granted" });
  }
);

// Health check
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "UP",
      uptime: process.uptime(),
      database: "CONNECTED",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({
      status: "DOWN",
      database: "DISCONNECTED",
    });
  }
});

// Routes
app.use("/auth", authRoutes);
app.use("/webhooks", webhookRoutes);
app.use('/orders', ordersRoutes)


export default app;
