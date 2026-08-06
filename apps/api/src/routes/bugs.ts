import { Router } from "express";
import { z } from "zod";
import * as bugService from "../services/bug.service.js";
import { BadRequestError } from "../utils/errors.js";

export const bugRouter = Router();

const createBugSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  screenshots: z.array(z.string().url()).default([]),
});

const updateStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
});

const addCommentSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

/**
 * @swagger
 * /bugs:
 *   get:
 *     summary: List all bugs with optional filters
 *     tags: [Bugs]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [open, in_progress, resolved, closed] }
 *         description: Filter by bug status
 *       - in: query
 *         name: severity
 *         schema: { type: string, enum: [low, medium, high, critical] }
 *         description: Filter by bug severity
 *     responses:
 *       200:
 *         description: List of bugs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array }
 */
bugRouter.get("/", async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const severity = req.query.severity as string | undefined;
    const bugs = await bugService.listBugs({ status, severity });
    res.json({ data: bugs });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /bugs/{id}:
 *   get:
 *     summary: Get a bug with its comments
 *     tags: [Bugs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Bug UUID
 *     responses:
 *       200: { description: Bug with comments }
 *       404: { description: Bug not found }
 */
bugRouter.get("/:id", async (req, res, next) => {
  try {
    const bug = await bugService.getBugById(req.params.id);
    res.json({ data: bug });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /bugs:
 *   post:
 *     summary: Create a new bug report
 *     tags: [Bugs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, severity]
 *             properties:
 *               title: { type: string, maxLength: 200 }
 *               description: { type: string }
 *               severity: { type: string, enum: [low, medium, high, critical] }
 *               screenshots:
 *                 type: array
 *                 items: { type: string, format: uri }
 *     responses:
 *       201: { description: Bug created }
 *       400: { description: Validation error }
 */
bugRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createBugSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const bug = await bugService.createBug({
      title: parsed.data.title,
      description: parsed.data.description,
      severity: parsed.data.severity,
      screenshots: parsed.data.screenshots,
      reporterId: req.user!.userId,
    });

    res.status(201).json({ data: bug });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /bugs/{id}/status:
 *   patch:
 *     summary: Update bug status
 *     tags: [Bugs]
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [open, in_progress, resolved, closed] }
 *     responses:
 *       200: { description: Status updated }
 *       400: { description: Validation error }
 *       404: { description: Bug not found }
 */
bugRouter.patch("/:id/status", async (req, res, next) => {
  try {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const bug = await bugService.updateBugStatus(
      req.params.id,
      parsed.data.status
    );
    res.json({ data: bug });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /bugs/{id}/comments:
 *   post:
 *     summary: Add a comment to a bug
 *     tags: [Bugs]
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
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *     responses:
 *       201: { description: Comment added }
 *       400: { description: Validation error }
 */
bugRouter.post("/:id/comments", async (req, res, next) => {
  try {
    const parsed = addCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const comment = await bugService.addComment({
      bugId: req.params.id,
      authorId: req.user!.userId,
      authorName: req.user!.email,
      message: parsed.data.message,
    });

    res.status(201).json({ data: comment });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /bugs/{id}/close:
 *   post:
 *     summary: Close a bug
 *     tags: [Bugs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Bug closed }
 *       404: { description: Bug not found }
 */
bugRouter.post("/:id/close", async (req, res, next) => {
  try {
    const bug = await bugService.closeBug(req.params.id, req.user!.userId);
    res.json({ data: bug });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /bugs/{id}/reopen:
 *   post:
 *     summary: Reopen a closed bug
 *     tags: [Bugs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Bug reopened }
 *       404: { description: Bug not found }
 */
bugRouter.post("/:id/reopen", async (req, res, next) => {
  try {
    const bug = await bugService.reopenBug(req.params.id, req.user!.userId);
    res.json({ data: bug });
  } catch (err) {
    next(err);
  }
});
