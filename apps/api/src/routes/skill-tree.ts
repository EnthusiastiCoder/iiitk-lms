import { Router } from "express";
import { getSkillTreeData } from "../services/skill-tree.service.js";

/** Router for skill tree endpoints. */
export const skillTreeRouter = Router();

/**
 * @swagger
 * /skill-tree:
 *   get:
 *     summary: Get skill tree data with courses and optionally nodes/edges for a course
 *     tags: [Skill Tree]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *         description: Optional course UUID to load skill tree nodes and edges for
 *     responses:
 *       200:
 *         description: Skill tree data with courses list and optional nodes/edges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           title: { type: string }
 *                           accent_color: { type: string }
 *                     nodes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SkillTreeNode'
 *                     edges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SkillTreeEdge'
 *       401: { description: Authentication required }
 */
skillTreeRouter.get("/", async (req, res, next) => {
  try {
    const courseId = req.query.course as string | undefined;
    const data = await getSkillTreeData(courseId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
