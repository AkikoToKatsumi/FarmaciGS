"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// c:\Farmacia GS\backend\src\routes\dashboard.routes.ts
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/stats', auth_middleware_1.verifyToken, dashboard_controller_1.getDashboardStats);
exports.default = router;
