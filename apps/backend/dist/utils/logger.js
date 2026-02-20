"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeBody = sanitizeBody;
function sanitizeBody(body) {
    if (!body)
        return body;
    const clone = { ...body };
    if (clone.password)
        clone.password = "***";
    if (clone.accessToken)
        clone.accessToken = "***";
    if (clone.refreshToken)
        clone.refreshToken = "***";
    return clone;
}
