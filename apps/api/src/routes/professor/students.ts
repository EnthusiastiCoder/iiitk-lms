import { Router } from "express";
import * as professorService from "../../services/professor.service.js";

export const professorStudentRouter = Router();

/**
 * @swagger
 * /professor/students:
 *   get:
 *     summary: Get paginated student roster with optional search
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of students
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires professor role
 */
professorStudentRouter.get("/students", async (req, res, next) => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = req.query.search as string | undefined;

    const result = await professorService.getStudentRoster({
      page,
      limit,
      search,
    });

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /professor/students/{id}:
 *   get:
 *     summary: Get detailed information about a specific student
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Student detail with profile, stats, enrollments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires professor role
 *       404:
 *         description: Student not found
 */
professorStudentRouter.get("/students/:id", async (req, res, next) => {
  try {
    const detail = await professorService.getStudentDetail(req.params.id);
    res.json({ data: detail });
  } catch (err) {
    next(err);
  }
});
