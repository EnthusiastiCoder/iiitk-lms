import { Router } from "express";
import { z } from "zod";
import * as lessonService from "../services/lesson.service.js";
import { BadRequestError } from "../utils/errors.js";

export const lessonRouter = Router();

const completeSchema = z.object({
  courseId: z.string().uuid(),
});

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     summary: Get lesson content by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Lesson UUID
 *     responses:
 *       200: { description: Lesson content }
 *       404: { description: Lesson not found }
 */
lessonRouter.get("/:id", async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonContent(req.params.id);
    res.json({ data: lesson });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /lessons/{id}/flashcards:
 *   get:
 *     summary: Get flashcard deck for a lesson
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Lesson UUID
 *     responses:
 *       200: { description: Flashcard deck or null }
 */
lessonRouter.get("/:id/flashcards", async (req, res, next) => {
  try {
    const deck = await lessonService.getFlashcardDeck(req.params.id);
    res.json({ data: deck });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /lessons/{id}/complete:
 *   post:
 *     summary: Mark a lesson as completed
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Lesson UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId]
 *             properties:
 *               courseId: { type: string, format: uuid }
 *     responses:
 *       200: { description: Completion result with XP earned }
 *       400: { description: Validation error }
 *       404: { description: Lesson not found }
 */
lessonRouter.post("/:id/complete", async (req, res, next) => {
  try {
    const parsed = completeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const result = await lessonService.completeLesson(
      req.user!.userId,
      req.params.id,
      parsed.data.courseId
    );

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});
