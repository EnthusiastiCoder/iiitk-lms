import { Router } from "express";
import { z } from "zod";
import * as submissionService from "../services/submission.service.js";
import { BadRequestError } from "../utils/errors.js";

export const projectRouter = Router();

const submitSchema = z.object({
  courseId: z.string().uuid(),
  code: z.string().min(1, "Code is required"),
  fileUrls: z.array(z.string().url()).optional(),
});

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a project by ID with user submission
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Project UUID
 *     responses:
 *       200: { description: Project with optional submission }
 *       404: { description: Project not found }
 */
projectRouter.get("/:id", async (req, res, next) => {
  try {
    const result = await submissionService.getProject(
      req.params.id,
      req.user!.userId
    );
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /projects/{id}/submit:
 *   post:
 *     summary: Submit code for a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Project UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, code]
 *             properties:
 *               courseId: { type: string, format: uuid }
 *               code: { type: string }
 *               fileUrls:
 *                 type: array
 *                 items: { type: string, format: uri }
 *     responses:
 *       201: { description: Submission created }
 *       400: { description: Validation error }
 */
projectRouter.post("/:id/submit", async (req, res, next) => {
  try {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const submission = await submissionService.submitProject({
      userId: req.user!.userId,
      projectId: req.params.id,
      courseId: parsed.data.courseId,
      code: parsed.data.code,
      fileUrls: parsed.data.fileUrls,
    });

    res.status(201).json({ data: submission });
  } catch (err) {
    next(err);
  }
});
