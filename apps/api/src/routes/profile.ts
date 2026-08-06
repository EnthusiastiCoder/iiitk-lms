import { Router } from "express";
import { z } from "zod";
import * as profileService from "../services/profile.service.js";
import { BadRequestError } from "../utils/errors.js";

export const profileRouter = Router();

const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
});

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get the authenticated user's full profile
 *     tags: [Profile]
 *     responses:
 *       200: { description: Full profile with stats, streaks, enrollments, and lesson count }
 *       404: { description: Profile not found }
 */
profileRouter.get("/", async (req, res, next) => {
  try {
    const data = await profileService.getFullProfile(req.user!.userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /profile:
 *   patch:
 *     summary: Update the authenticated user's profile
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name]
 *             properties:
 *               full_name: { type: string, minLength: 2 }
 *     responses:
 *       200: { description: Updated profile }
 *       400: { description: Validation error }
 */
profileRouter.patch("/", async (req, res, next) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const data = await profileService.updateProfile(
      req.user!.userId,
      parsed.data.full_name
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
