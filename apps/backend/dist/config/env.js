"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_SECRET = exports.ACCESS_SECRET = void 0;
exports.ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
exports.REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!exports.ACCESS_SECRET || !exports.REFRESH_SECRET) {
    throw new Error("JWT secrets must be defined in environment variables");
}
