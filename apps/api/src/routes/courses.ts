import { Router } from "express";
import * as courseService from "../services/course.service.js";

export const courseRouter = Router();

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       401: { description: Authentication required }
 */
courseRouter.get("/", async (_req, res, next) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json({ data: courses });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /courses/{slug}:
 *   get:
 *     summary: Get a single course by slug
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The course slug
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       401: { description: Authentication required }
 *       404: { description: Course not found }
 */
courseRouter.get("/:slug", async (req, res, next) => {
  try {
    const course = await courseService.getCourseBySlug(req.params.slug);
    res.json({ data: course });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /courses/{slug}/full:
 *   get:
 *     summary: Get a course with all modules and content
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The course slug
 *     responses:
 *       200:
 *         description: Course with nested modules, lessons, quizzes, assignments, projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/CourseWithModules'
 *       401: { description: Authentication required }
 *       404: { description: Course not found }
 */
courseRouter.get("/:slug/full", async (req, res, next) => {
  try {
    const course = await courseService.getCourseWithModules(req.params.slug);
    res.json({ data: course });
  } catch (err) {
    next(err);
  }
});
