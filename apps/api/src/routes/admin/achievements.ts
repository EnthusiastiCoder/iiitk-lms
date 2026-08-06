import { Router } from "express";
import { z } from "zod";
import { BadRequestError } from "../../utils/errors.js";
import * as achievementService from "../../services/admin/achievements.js";

export const adminAchievementRouter = Router();

const createAchievementSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  icon: z.string().min(1),
  category: z.enum(["learning", "streak", "social", "mastery"]),
  rarity: z.enum(["common", "rare", "epic", "legendary"]),
  xp_reward: z.number().int().min(0),
  condition_description: z.string().nullable(),
  max_progress: z.number().int().nullable(),
});

/**
 * @swagger
 * /admin/achievements:
 *   get:
 *     summary: Get all achievements
 *     tags: [Admin - Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of all achievements }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden - requires admin role }
 */
adminAchievementRouter.get("/achievements", async (_req, res, next) => {
  try {
    const achievements = await achievementService.getAllAchievements();
    res.json({ data: achievements });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/achievements:
 *   post:
 *     summary: Create a new achievement
 *     tags: [Admin - Achievements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, icon, category, rarity, xp_reward]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               icon: { type: string }
 *               category: { type: string, enum: [learning, streak, social, mastery] }
 *               rarity: { type: string, enum: [common, rare, epic, legendary] }
 *               xp_reward: { type: integer }
 *               condition_description: { type: string, nullable: true }
 *               max_progress: { type: integer, nullable: true }
 *     responses:
 *       201: { description: Achievement created }
 *       400: { description: Validation error }
 */
adminAchievementRouter.post("/achievements", async (req, res, next) => {
  try {
    const parsed = createAchievementSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const achievement = await achievementService.createAchievement(parsed.data);
    res.status(201).json({ data: achievement });
  } catch (err) {
    next(err);
  }
});
