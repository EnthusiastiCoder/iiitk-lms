import { Router } from "express";
import * as analyticsService from "../../services/admin/analytics.js";

export const adminAnalyticsRouter = Router();

/**
 * @swagger
 * /admin/audit-log:
 *   get:
 *     summary: Get recent XP transactions audit log
 *     tags: [Admin - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent 100 XP transactions with user info
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 */
adminAnalyticsRouter.get("/audit-log", async (_req, res, next) => {
  try {
    const log = await analyticsService.getAuditLog();
    res.json({ data: log });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get analytics data (user growth, enrollment distribution, top students)
 *     tags: [Admin - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 */
adminAnalyticsRouter.get("/analytics", async (_req, res, next) => {
  try {
    const data = await analyticsService.getAnalyticsData();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
