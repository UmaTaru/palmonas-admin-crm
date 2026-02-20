"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const pool_1 = require("./database/pool");
const migrate_1 = require("./database/migrate");
const seed_1 = require("./database/seed");
const config_service_1 = require("./config/config.service");
const seed_2 = require("./database/seed");
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
let server;
const startServer = async () => {
    try {
        await (0, pool_1.checkDatabaseConnection)();
        await (0, migrate_1.runMigrations)();
        await (0, seed_1.seedAdminUser)();
        await (0, seed_2.seedDefaultConfigs)();
        await config_service_1.configService.load();
        server = app_1.default.listen(PORT, () => {
            console.log(`🚀 Backend running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
const shutdown = (signal) => {
    console.log(`⚠️  Received ${signal}. Shutting down gracefully...`);
    if (server) {
        server.close(() => {
            console.log("✅ HTTP server closed.");
            process.exit(0);
        });
    }
    setTimeout(() => {
        console.error("❌ Forcefully shutting down...");
        process.exit(1);
    }, 10000);
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
startServer();
