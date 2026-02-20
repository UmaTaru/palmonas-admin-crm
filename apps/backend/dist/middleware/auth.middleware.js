"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function getAccessSecret() {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET is not defined");
    }
    return secret;
}
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, getAccessSecret());
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.authMiddleware = authMiddleware;
