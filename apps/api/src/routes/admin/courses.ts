import { Router } from "express";
import { z } from "zod";
import { BadRequestError } from "../../utils/errors.js";
import * as courseService from "../../services/admin/courses.js";

export const adminCourseRouter = Router();

const createCourseSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  long_description: z.string(),
  accent_color: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  category: z.enum(["regular", "backlog"]),
  estimated_hours: z.number().min(0),
  instructor_id: z.string().uuid().nullable(),
  prerequisites: z.array(z.string()),
  tags: z.array(z.string()),
  total_lessons: z.number().int().min(0),
  total_xp: z.number().int().min(0),
});

const assignInstructorSchema = z.object({
  professor_id: z.string().uuid(),
});

/**
 * @swagger
 * /admin/courses:
 *   get:
 *     summary: Get all courses with enrollment counts
 *     tags: [Admin - Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of courses with enrollment counts }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden - requires admin role }
 */
adminCourseRouter.get("/courses", async (_req, res, next) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json({ data: courses });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Admin - Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, slug, description, difficulty, category]
 *             properties:
 *               title: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               long_description: { type: string }
 *               accent_color: { type: string }
 *               difficulty: { type: string, enum: [beginner, intermediate, advanced] }
 *               category: { type: string, enum: [regular, backlog] }
 *               estimated_hours: { type: number }
 *               instructor_id: { type: string, format: uuid, nullable: true }
 *               prerequisites: { type: array, items: { type: string } }
 *               tags: { type: array, items: { type: string } }
 *               total_lessons: { type: integer }
 *               total_xp: { type: integer }
 *     responses:
 *       201: { description: Course created }
 *       400: { description: Validation error }
 */
adminCourseRouter.post("/courses", async (req, res, next) => {
  try {
    const parsed = createCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const course = await courseService.createCourse(parsed.data);
    res.status(201).json({ data: course });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Admin - Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Course deleted }
 *       404: { description: Course not found }
 */
adminCourseRouter.delete("/courses/:id", async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/courses/{id}/instructor:
 *   patch:
 *     summary: Assign an instructor to a course
 *     tags: [Admin - Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [professor_id]
 *             properties:
 *               professor_id: { type: string, format: uuid }
 *     responses:
 *       200: { description: Instructor assigned }
 *       400: { description: Validation error }
 *       404: { description: Course not found }
 */
adminCourseRouter.patch("/courses/:id/instructor", async (req, res, next) => {
  try {
    const parsed = assignInstructorSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const course = await courseService.assignInstructor(
      req.params.id,
      parsed.data.professor_id
    );
    res.json({ data: course });
  } catch (err) {
    next(err);
  }
});
