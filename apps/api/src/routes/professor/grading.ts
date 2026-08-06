import { Router } from "express";
import * as professorService from "../../services/professor.service.js";

export const professorGradingRouter = Router();

/**
 * @swagger
 * /professor/pending:
 *   get:
 *     summary: Get pending submissions for the professor's courses
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending assignment and project submissions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires professor role
 */
professorGradingRouter.get("/pending", async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const pending = await professorService.getPendingSubmissions(userId);
    res.json({ data: pending });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /professor/graded:
 *   get:
 *     summary: Get recently graded submissions for the professor's courses
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recently graded assignment and project submissions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires professor role
 */
professorGradingRouter.get("/graded", async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const graded = await professorService.getRecentGraded(userId);
    res.json({ data: graded });
  } catch (err) {
    next(err);
  }
});
