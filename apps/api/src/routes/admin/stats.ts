import { Router } from "express";
import * as analyticsService from "../../services/admin/analytics.js";

export const adminStatsRouter = Router();

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get aggregate system statistics
 *     tags: [Admin - Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System stats (users, courses, lessons, submissions, XP)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 */
adminStatsRouter.get("/stats", async (_req, res, next) => {
  try {
    const stats = await analyticsService.getSystemStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});
