import { Router } from "express";
import { z } from "zod";
import * as quizService from "../services/quiz.service.js";
import { BadRequestError } from "../utils/errors.js";

export const quizRouter = Router();

const attemptSchema = z.object({
  answers: z.record(z.string(), z.string()),
  score: z.number().min(0).max(100),
  timeSpent: z.number().min(0),
});

/**
 * @swagger
 * /quizzes/{id}:
 *   get:
 *     summary: Get quiz with its questions
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Quiz UUID
 *     responses:
 *       200: { description: Quiz with questions }
 *       404: { description: Quiz not found }
 */
quizRouter.get("/:id", async (req, res, next) => {
  try {
    const quiz = await quizService.getQuizWithQuestions(req.params.id);
    res.json({ data: quiz });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /quizzes/{id}/attempt:
 *   post:
 *     summary: Submit a quiz attempt
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Quiz UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers, score, timeSpent]
 *             properties:
 *               answers:
 *                 type: object
 *                 additionalProperties: { type: string }
 *               score: { type: number, minimum: 0, maximum: 100 }
 *               timeSpent: { type: number, minimum: 0 }
 *     responses:
 *       200: { description: Attempt result with score and XP earned }
 *       400: { description: Validation error }
 *       404: { description: Quiz not found }
 */
quizRouter.post("/:id/attempt", async (req, res, next) => {
  try {
    const parsed = attemptSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const result = await quizService.submitQuizAttempt({
      userId: req.user!.userId,
      quizId: req.params.id,
      answers: parsed.data.answers,
      score: parsed.data.score,
      timeSpent: parsed.data.timeSpent,
    });

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});
