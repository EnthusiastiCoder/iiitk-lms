import { Router } from "express";
import { z } from "zod";
import { BadRequestError } from "../../utils/errors.js";
import * as userService from "../../services/admin/users.js";

export const adminUserRouter = Router();

const roleSchema = z.object({
  role: z.enum(["student", "professor", "admin"]),
});

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get paginated user list with optional search and role filter
 *     tags: [Admin - Users]
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
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [student, professor, admin] }
 *     responses:
 *       200: { description: Paginated user list }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden - requires admin role }
 */
adminUserRouter.get("/users", async (req, res, next) => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;

    const result = await userService.getUserList({
      page,
      limit,
      search,
      role,
    });

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/users/professors:
 *   get:
 *     summary: Get list of all professors
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of professor profiles }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden - requires admin role }
 */
adminUserRouter.get("/users/professors", async (_req, res, next) => {
  try {
    const professors = await userService.getProfessorList();
    res.json({ data: professors });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get a user by ID with profile, stats, and enrollments
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: User detail }
 *       404: { description: User not found }
 */
adminUserRouter.get("/users/:id", async (req, res, next) => {
  try {
    const data = await userService.getUserById(req.params.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Update a user's role
 *     tags: [Admin - Users]
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
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [student, professor, admin] }
 *     responses:
 *       200: { description: Role updated }
 *       400: { description: Invalid role }
 *       404: { description: User not found }
 */
adminUserRouter.patch("/users/:id/role", async (req, res, next) => {
  try {
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const data = await userService.updateUserRole(
      req.params.id,
      parsed.data.role
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: User deleted }
 *       404: { description: User not found }
 */
adminUserRouter.delete("/users/:id", async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
