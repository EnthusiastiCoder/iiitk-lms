import { Router } from "express";
import * as gamificationService from "../services/gamification.service.js";

export const gamificationRouter = Router();

/**
 * @swagger
 * /gamification/leaderboard:
 *   get:
 *     summary: Get the XP leaderboard (top 50 users)
 *     tags: [Gamification]
 *     responses:
 *       200: { description: Array of leaderboard entries with profile and stats }
 */
gamificationRouter.get("/leaderboard", async (_req, res, next) => {
  try {
    const data = await gamificationService.getLeaderboard();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /gamification/achievements:
 *   get:
 *     summary: Get all achievements with the user's progress and earned status
 *     tags: [Gamification]
 *     responses:
 *       200: { description: Array of achievements with progress }
 */
gamificationRouter.get("/achievements", async (req, res, next) => {
  try {
    const data = await gamificationService.getUserAchievements(
      req.user!.userId
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /gamification/streaks:
 *   get:
 *     summary: Get streak log for the last 30 days
 *     tags: [Gamification]
 *     responses:
 *       200: { description: Array of streak log entries }
 */
gamificationRouter.get("/streaks", async (req, res, next) => {
  try {
    const data = await gamificationService.getStreakData(req.user!.userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /gamification/weekly-xp:
 *   get:
 *     summary: Get daily XP totals for the current week (Mon-Sun)
 *     tags: [Gamification]
 *     responses:
 *       200: { description: Array of 7 daily XP entries }
 */
gamificationRouter.get("/weekly-xp", async (req, res, next) => {
  try {
    const data = await gamificationService.getWeeklyXp(req.user!.userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
