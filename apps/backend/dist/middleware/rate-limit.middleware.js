"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later.",
    },
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        message: "Too many login attempts.",
    },
});
exports.webhookLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 200,
});
