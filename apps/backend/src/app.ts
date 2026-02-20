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
import logsRoutes from "./modules/logs/logs.routes";
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import { pool } from "./database/pool";
import { sanitizeBody } from "./utils/logger";
import { apiLimiter } from "./middleware/rate-limit.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { redis } from "./cache/redis";

const app = express();

// Health check
app.get("/health", async (req, res) => {
  try {
    // Explicitly set CORS headers for this endpoint
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "UP",
      uptime: process.uptime(),
      database: "CONNECTED",
      redis: redis.status,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({
      status: "DOWN",
      database: "DISCONNECTED",
      redis: redis.status,
    });
  }
});

// app.use(apiLimiter);

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

// CORS middleware (before helmet to avoid conflicts)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

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

// Routes
app.use("/auth", authRoutes);
app.use("/webhooks", webhookRoutes);
app.use('/orders', ordersRoutes);
app.use('/logs', logsRoutes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
