"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logs_controller_1 = require("./logs.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new logs_controller_1.LogsController();
router.get("/", auth_middleware_1.authMiddleware, controller.getLogs.bind(controller));
exports.default = router;
