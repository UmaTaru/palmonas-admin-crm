"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabaseConnection = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const checkDatabaseConnection = async () => {
    try {
        const client = await exports.pool.connect();
        await client.query("SELECT 1");
        client.release();
        console.log("✅ Database connected successfully");
    }
    catch (error) {
        console.error("❌ Database connection failed", error);
        process.exit(1);
    }
};
exports.checkDatabaseConnection = checkDatabaseConnection;
