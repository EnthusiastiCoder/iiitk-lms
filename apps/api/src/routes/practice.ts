import { Router } from "express";
import { getPracticeData } from "../services/practice.service.js";

/** Router for practice-related endpoints. */
export const practiceRouter = Router();

/**
 * @swagger
 * /practice:
 *   get:
 *     summary: Get all practice quizzes, attempts, and courses for the authenticated user
 *     tags: [Practice]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Practice data with quizzes, attempts, and enrolled courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     quizzes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Quiz'
 *                     attempts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/QuizAttempt'
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           title: { type: string }
 *                           slug: { type: string }
 *       401: { description: Authentication required }
 */
practiceRouter.get("/", async (req, res, next) => {
  try {
    const data = await getPracticeData(req.user!.userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
