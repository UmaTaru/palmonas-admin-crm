import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import pino from "pino";

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

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default app;
