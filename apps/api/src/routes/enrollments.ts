import { Router } from "express";
import { z } from "zod";
import * as enrollmentService from "../services/enrollment.service.js";
import { BadRequestError } from "../utils/errors.js";

export const enrollmentRouter = Router();

const enrollSchema = z.object({
  courseId: z.string().uuid(),
});

/**
 * @swagger
 * /enrollments:
 *   get:
 *     summary: Get current user's enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Enrollment'
 *       401: { description: Authentication required }
 */
enrollmentRouter.get("/", async (req, res, next) => {
  try {
    const enrollments = await enrollmentService.getUserEnrollments(
      req.user!.userId
    );
    res.json({ data: enrollments });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
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
 *       201: { description: Enrolled successfully }
 *       400: { description: Validation error }
 *       401: { description: Authentication required }
 *       404: { description: Course not found }
 *       409: { description: Already enrolled }
 */
enrollmentRouter.post("/", async (req, res, next) => {
  try {
    const parsed = enrollSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const enrollment = await enrollmentService.enrollInCourse(
      req.user!.userId,
      parsed.data.courseId
    );
    res.status(201).json({ data: enrollment });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /enrollments/completions:
 *   get:
 *     summary: Get current user's lesson completions
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional course ID to filter completions
 *     responses:
 *       200:
 *         description: List of lesson completions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LessonCompletion'
 *       401: { description: Authentication required }
 */
enrollmentRouter.get("/completions", async (req, res, next) => {
  try {
    const courseId = req.query.courseId as string | undefined;
    const completions = await enrollmentService.getUserCompletions(
      req.user!.userId,
      courseId
    );
    res.json({ data: completions });
  } catch (err) {
    next(err);
  }
});
