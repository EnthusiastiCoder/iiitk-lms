import { Router } from "express";
import { z } from "zod";
import * as submissionService from "../services/submission.service.js";
import { BadRequestError } from "../utils/errors.js";

export const assignmentRouter = Router();

const submitSchema = z.object({
  courseId: z.string().uuid(),
  code: z.string().min(1, "Code is required"),
  fileUrls: z.array(z.string().url()).optional(),
});

/**
 * @swagger
 * /assignments/{id}:
 *   get:
 *     summary: Get an assignment by ID with user submission
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Assignment UUID
 *     responses:
 *       200: { description: Assignment with optional submission }
 *       404: { description: Assignment not found }
 */
assignmentRouter.get("/:id", async (req, res, next) => {
  try {
    const result = await submissionService.getAssignment(
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
 * /assignments/{id}/submit:
 *   post:
 *     summary: Submit code for an assignment
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Assignment UUID
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
assignmentRouter.post("/:id/submit", async (req, res, next) => {
  try {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const submission = await submissionService.submitAssignment(
      req.user!.userId,
      req.params.id,
      parsed.data.courseId,
      parsed.data.code,
      parsed.data.fileUrls
    );

    res.status(201).json({ data: submission });
  } catch (err) {
    next(err);
  }
});
