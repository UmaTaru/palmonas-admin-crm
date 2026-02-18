import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import pino from "pino";
import authRoutes from "./modules/auth/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";

const app = express();

// Logger
const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

app.use(pinoHttp({ logger }));

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());

app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authenticated" });
});


// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/auth", authRoutes);

export default app;
