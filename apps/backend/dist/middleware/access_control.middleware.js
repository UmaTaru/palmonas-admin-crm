"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};
exports.authorize = authorize;
