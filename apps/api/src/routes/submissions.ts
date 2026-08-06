import { Router } from "express";
import { z } from "zod";
import * as submissionService from "../services/submission.service.js";
import { requireProfessor } from "../middleware/roles.js";
import { BadRequestError } from "../utils/errors.js";

export const submissionRouter = Router();

const gradeSchema = z.object({
  table: z.enum(["assignment_submissions", "project_submissions"]),
  grade: z.number().min(0).max(100),
  feedback: z.string().min(1, "Feedback is required"),
});

/**
 * @swagger
 * /submissions:
 *   get:
 *     summary: Get all submissions for the authenticated user
 *     tags: [Submissions]
 *     responses:
 *       200:
 *         description: User submissions grouped by type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignments: { type: array }
 *                     projects: { type: array }
 *                     quizzes: { type: array }
 */
submissionRouter.get("/", async (req, res, next) => {
  try {
    const result = await submissionService.getUserSubmissions(
      req.user!.userId
    );
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /submissions/{id}/grade:
 *   post:
 *     summary: Grade a submission (professor/admin only)
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Submission UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [table, grade, feedback]
 *             properties:
 *               table:
 *                 type: string
 *                 enum: [assignment_submissions, project_submissions]
 *               grade: { type: number, minimum: 0, maximum: 100 }
 *               feedback: { type: string }
 *     responses:
 *       200: { description: Submission graded }
 *       400: { description: Validation error }
 *       403: { description: Insufficient permissions }
 *       404: { description: Submission not found }
 */
submissionRouter.post("/:id/grade", requireProfessor, async (req, res, next) => {
  try {
    const parsed = gradeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const result = await submissionService.gradeSubmission(
      String(req.params.id),
      parsed.data.table,
      parsed.data.grade,
      parsed.data.feedback
    );

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});
