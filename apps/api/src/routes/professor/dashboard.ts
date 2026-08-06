import { Router } from "express";
import * as professorService from "../../services/professor.service.js";

export const professorDashboardRouter = Router();

/**
 * @swagger
 * /professor/stats:
 *   get:
 *     summary: Get class statistics for the professor's courses
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of course stats with enrollment and completion data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires professor role
 */
professorDashboardRouter.get("/stats", async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const stats = await professorService.getClassStats(userId);
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});
