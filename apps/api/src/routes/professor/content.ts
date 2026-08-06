import { Router } from "express";
import { z } from "zod";
import { BadRequestError } from "../../utils/errors.js";
import * as contentService from "../../services/content/index.js";

export const professorContentRouter = Router();

const moduleSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  order: z.number().int().min(0),
  course_id: z.string().uuid(),
});

const questionSchema = z.object({
  type: z.enum(["multiple-choice", "true-false", "fill-blank"]),
  question: z.string().min(1),
  options: z.array(z.string()).nullable(),
  correct_answer: z.string().min(1),
  explanation: z.string(),
  xp_reward: z.number().int().min(0),
  order: z.number().int().min(0),
});

function validate<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues[0].message);
  }
  return parsed.data;
}

/** @swagger
 * /professor/courses/{slug}/content:
 *   get:
 *     summary: Get full course content
 *     tags: [Professor - Content]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Course with modules and all content }
 *       404: { description: Course not found } */
professorContentRouter.get("/courses/:slug/content", async (req, res, next) => {
  try {
    const data = await contentService.getCourseContentForProfessor(req.params.slug);
    res.json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/courses/{slug}/modules:
 *   post:
 *     summary: Create a module in a course
 *     tags: [Professor - Content]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Module created }
 *       400: { description: Validation error } */
professorContentRouter.post("/courses/:slug/modules", async (req, res, next) => {
  try {
    const body = validate(moduleSchema, req.body);
    const data = await contentService.createModule(body.course_id, body);
    res.status(201).json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/modules/{id}:
 *   patch:
 *     summary: Update a module
 *     tags: [Professor - Content]
 *     responses: { 200: { description: Updated }, 404: { description: Not found } } */
professorContentRouter.patch("/modules/:id", async (req, res, next) => {
  try {
    const data = await contentService.updateModule(req.params.id, req.body);
    res.json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/modules/{id}:
 *   delete:
 *     summary: Delete a module
 *     tags: [Professor - Content]
 *     responses: { 204: { description: Deleted }, 404: { description: Not found } } */
professorContentRouter.delete("/modules/:id", async (req, res, next) => {
  try {
    await contentService.deleteModule(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/modules/{id}/lessons:
 *   post:
 *     summary: Create a lesson in a module
 *     tags: [Professor - Content]
 *     responses: { 201: { description: Created }, 400: { description: Validation error } } */
professorContentRouter.post("/modules/:id/lessons", async (req, res, next) => {
  try {
    const data = await contentService.createLesson(req.params.id, req.body);
    res.status(201).json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/lessons/{id}:
 *   patch:
 *     summary: Update a lesson
 *     tags: [Professor - Content]
 *     responses: { 200: { description: Updated }, 404: { description: Not found } } */
professorContentRouter.patch("/lessons/:id", async (req, res, next) => {
  try {
    const data = await contentService.updateLesson(req.params.id, req.body);
    res.json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/lessons/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Professor - Content]
 *     responses: { 204: { description: Deleted }, 404: { description: Not found } } */
professorContentRouter.delete("/lessons/:id", async (req, res, next) => {
  try {
    await contentService.deleteLesson(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/modules/{id}/quizzes:
 *   post:
 *     summary: Create a quiz in a module
 *     tags: [Professor - Content]
 *     responses: { 201: { description: Created }, 400: { description: Validation error } } */
professorContentRouter.post("/modules/:id/quizzes", async (req, res, next) => {
  try {
    const data = await contentService.createQuiz(req.params.id, req.body);
    res.status(201).json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/quizzes/{id}/questions:
 *   post:
 *     summary: Create a question for a quiz
 *     tags: [Professor - Content]
 *     responses: { 201: { description: Created }, 400: { description: Validation error } } */
professorContentRouter.post("/quizzes/:id/questions", async (req, res, next) => {
  try {
    const body = validate(questionSchema, req.body);
    const data = await contentService.createQuizQuestion(req.params.id, body);
    res.status(201).json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/quizzes/{id}:
 *   patch:
 *     summary: Update a quiz
 *     tags: [Professor - Content]
 *     responses: { 200: { description: Updated }, 404: { description: Not found } } */
professorContentRouter.patch("/quizzes/:id", async (req, res, next) => {
  try {
    const data = await contentService.updateQuiz(req.params.id, req.body);
    res.json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/questions/{id}:
 *   patch:
 *     summary: Update a quiz question
 *     tags: [Professor - Content]
 *     responses: { 200: { description: Updated }, 404: { description: Not found } } */
professorContentRouter.patch("/questions/:id", async (req, res, next) => {
  try {
    const data = await contentService.updateQuizQuestion(req.params.id, req.body);
    res.json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/quizzes/{id}:
 *   delete:
 *     summary: Delete a quiz
 *     tags: [Professor - Content]
 *     responses: { 204: { description: Deleted }, 404: { description: Not found } } */
professorContentRouter.delete("/quizzes/:id", async (req, res, next) => {
  try {
    await contentService.deleteQuiz(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/modules/{id}/assignments:
 *   post:
 *     summary: Create an assignment in a module
 *     tags: [Professor - Content]
 *     responses: { 201: { description: Created }, 400: { description: Validation error } } */
professorContentRouter.post("/modules/:id/assignments", async (req, res, next) => {
  try {
    const data = await contentService.createAssignment(req.params.id, req.body);
    res.status(201).json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/assignments/{id}:
 *   patch:
 *     summary: Update an assignment
 *     tags: [Professor - Content]
 *     responses: { 200: { description: Updated }, 404: { description: Not found } } */
professorContentRouter.patch("/assignments/:id", async (req, res, next) => {
  try {
    const data = await contentService.updateAssignment(req.params.id, req.body);
    res.json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/assignments/{id}:
 *   delete:
 *     summary: Delete an assignment
 *     tags: [Professor - Content]
 *     responses: { 204: { description: Deleted }, 404: { description: Not found } } */
professorContentRouter.delete("/assignments/:id", async (req, res, next) => {
  try {
    await contentService.deleteAssignment(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/modules/{id}/projects:
 *   post:
 *     summary: Create a project in a module
 *     tags: [Professor - Content]
 *     responses: { 201: { description: Created }, 400: { description: Validation error } } */
professorContentRouter.post("/modules/:id/projects", async (req, res, next) => {
  try {
    const data = await contentService.createProject(req.params.id, req.body);
    res.status(201).json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/projects/{id}:
 *   patch:
 *     summary: Update a project
 *     tags: [Professor - Content]
 *     responses: { 200: { description: Updated }, 404: { description: Not found } } */
professorContentRouter.patch("/projects/:id", async (req, res, next) => {
  try {
    const data = await contentService.updateProject(req.params.id, req.body);
    res.json({ data });
  } catch (err) { next(err); }
});

/** @swagger
 * /professor/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Professor - Content]
 *     responses: { 204: { description: Deleted }, 404: { description: Not found } } */
professorContentRouter.delete("/projects/:id", async (req, res, next) => {
  try {
    await contentService.deleteProject(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});
