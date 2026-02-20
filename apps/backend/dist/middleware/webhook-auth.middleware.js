"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookAuth = webhookAuth;
function webhookAuth(req, res, next) {
    const key = req.headers["x-webhook-key"];
    if (key !== process.env.WEBHOOK_SECRET) {
        return res.status(401).json({
            message: "Unauthorized webhook",
        });
    }
    next();
}
