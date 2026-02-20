"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pool_1 = require("../../database/pool");
const config_service_1 = require("../../config/config.service");
function getAccessSecret() {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET is not defined");
    }
    return secret;
}
function getRefreshSecret() {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
        throw new Error("JWT_REFRESH_SECRET is not defined");
    }
    return secret;
}
class AuthService {
    async login(email, password) {
        const { rows } = await pool_1.pool.query("SELECT id, email, password_hash, role FROM users WHERE email = $1", [email]);
        if (rows.length === 0) {
            throw new Error("Row length is 0");
        }
        const user = rows[0];
        const isMatch = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error("Not Match credentials");
        }
        const accessExpirySeconds = Number(config_service_1.configService.get("ACCESS_TOKEN_EXPIRY"));
        const refreshExpirySeconds = Number(config_service_1.configService.get("REFRESH_TOKEN_EXPIRY"));
        if (isNaN(accessExpirySeconds) || accessExpirySeconds <= 0) {
            throw new Error("Invalid ACCESS_TOKEN_EXPIRY configuration");
        }
        if (isNaN(refreshExpirySeconds) || refreshExpirySeconds <= 0) {
            throw new Error("Invalid REFRESH_TOKEN_EXPIRY configuration");
        }
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, getAccessSecret(), {
            expiresIn: accessExpirySeconds,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, getRefreshSecret(), {
            expiresIn: refreshExpirySeconds,
        });
        return { accessToken, refreshToken };
    }
    async refresh(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, getRefreshSecret());
            const accessExpirySeconds = Number(config_service_1.configService.get("ACCESS_TOKEN_EXPIRY"));
            if (!accessExpirySeconds || isNaN(accessExpirySeconds)) {
                throw new Error("Invalid ACCESS_TOKEN_EXPIRY configuration");
            }
            const newAccessToken = jsonwebtoken_1.default.sign(decoded, getAccessSecret(), {
                expiresIn: accessExpirySeconds,
            });
            return { accessToken: newAccessToken };
        }
        catch (err) {
            throw new Error("Invalid or expired refresh token");
        }
    }
}
exports.AuthService = AuthService;
