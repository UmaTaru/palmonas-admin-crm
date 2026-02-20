"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pool_1 = require("./pool");
const runMigrations = async () => {
    const client = await pool_1.pool.connect();
    try {
        console.log("🔄 Running migrations...");
        await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);
        const migrationsDir = path_1.default.join(__dirname, "migrations");
        const files = fs_1.default.readdirSync(migrationsDir).sort();
        const { rows } = await client.query("SELECT name FROM migrations;");
        const appliedMigrations = rows.map((r) => r.name);
        for (const file of files) {
            if (!appliedMigrations.includes(file)) {
                const filePath = path_1.default.join(migrationsDir, file);
                const sql = fs_1.default.readFileSync(filePath, "utf-8");
                console.log(`📦 Applying migration: ${file}`);
                await client.query("BEGIN");
                await client.query(sql);
                await client.query("INSERT INTO migrations(name) VALUES($1)", [file]);
                await client.query("COMMIT");
                console.log(`✅ Migration applied: ${file}`);
            }
        }
        console.log("🎉 All migrations up to date.");
    }
    catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
    finally {
        client.release();
    }
};
exports.runMigrations = runMigrations;
