"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const pino_http_1 = __importDefault(require("pino-http"));
const pino_1 = __importDefault(require("pino"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const access_control_middleware_1 = require("./middleware/access_control.middleware");
const webhook_routes_1 = __importDefault(require("./routes/webhook.routes"));
const orders_routes_1 = __importDefault(require("./modules/orders/orders.routes"));
const logs_routes_1 = __importDefault(require("./modules/logs/logs.routes"));
const request_id_middleware_1 = require("./middleware/request-id.middleware");
const pool_1 = require("./database/pool");
const logger_1 = require("./utils/logger");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const redis_1 = require("./cache/redis");
const app = (0, express_1.default)();
app.get("/health", async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        await pool_1.pool.query("SELECT 1");
        res.status(200).json({
            status: "UP",
            uptime: process.uptime(),
            database: "CONNECTED",
            redis: redis_1.redis.status,
            timestamp: new Date().toISOString(),
        });
    }
    catch {
        res.status(500).json({
            status: "DOWN",
            database: "DISCONNECTED",
            redis: redis_1.redis.status,
        });
    }
});
app.use(request_id_middleware_1.requestIdMiddleware);
const logger = (0, pino_1.default)({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
});
app.use((0, pino_http_1.default)({
    logger,
    customProps: (req) => ({
        requestId: req.requestId,
        body: req.method !== "GET"
            ? (0, logger_1.sanitizeBody)(req.body)
            : undefined,
    }),
}));
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Request-Id']
}));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express_1.default.json());
app.get("/admin-only", auth_middleware_1.authMiddleware, (0, access_control_middleware_1.authorize)("SUPER_ADMIN"), (req, res) => {
    res.json({ message: "Admin access granted" });
});
app.use("/auth", auth_routes_1.default);
app.use("/webhooks", webhook_routes_1.default);
app.use('/orders', orders_routes_1.default);
app.use('/logs', logs_routes_1.default);
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
exports.default = app;
