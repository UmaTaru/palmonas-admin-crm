"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configService = void 0;
const pool_1 = require("../database/pool");
class ConfigService {
    constructor() {
        this.configMap = new Map();
    }
    async load() {
        const { rows } = await pool_1.pool.query("SELECT name, value FROM app_config WHERE status = 'active'");
        rows.forEach((row) => {
            this.configMap.set(row.name, row.value);
        });
        console.log("✅ Config loaded into memory");
    }
    get(key) {
        return this.configMap.get(key);
    }
}
exports.configService = new ConfigService();
