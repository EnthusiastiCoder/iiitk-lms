import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as bugService from "../services/bug.service.js";
import { env } from "../config/env.js";
import { UnauthorizedError, BadRequestError } from "../utils/errors.js";

export const mcpBugRouter = Router();

const replySchema = z.object({
  message: z.string().min(1, "Message is required"),
});

const statusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
});

/**
 * Middleware to verify MCP API key from x-mcp-key header.
 * @param req - Express request
 * @param _res - Express response (unused)
 * @param next - Express next function
 */
function requireMcpKey(req: Request, _res: Response, next: NextFunction): void {
  const key = req.headers["x-mcp-key"] as string | undefined;
  if (!key || key !== env.MCP_API_KEY) {
    next(new UnauthorizedError("Invalid or missing MCP API key"));
    return;
  }
  next();
}

mcpBugRouter.use(requireMcpKey);

/**
 * @swagger
 * /mcp/bugs:
 *   get:
 *     summary: List open bugs (MCP endpoint)
 *     tags: [MCP Bugs]
 *     parameters:
 *       - in: header
 *         name: x-mcp-key
 *         required: true
 *         schema: { type: string }
 *         description: MCP API key
 *     responses:
 *       200:
 *         description: List of open bugs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array }
 *       401: { description: Invalid API key }
 */
mcpBugRouter.get("/", async (_req, res, next) => {
  try {
    const bugs = await bugService.listBugs({ status: "open" });
    res.json({ data: bugs });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /mcp/bugs/{id}:
 *   get:
 *     summary: Get a bug with comments (MCP endpoint)
 *     tags: [MCP Bugs]
 *     parameters:
 *       - in: header
 *         name: x-mcp-key
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Bug with comments }
 *       401: { description: Invalid API key }
 *       404: { description: Bug not found }
 */
mcpBugRouter.get("/:id", async (req, res, next) => {
  try {
    const bug = await bugService.getBugById(req.params.id);
    res.json({ data: bug });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /mcp/bugs/{id}/reply:
 *   post:
 *     summary: Post a comment as Claude (MCP endpoint)
 *     tags: [MCP Bugs]
 *     parameters:
 *       - in: header
 *         name: x-mcp-key
 *         required: true
 *         schema: { type: string }
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
 *       201: { description: Comment posted }
 *       400: { description: Validation error }
 *       401: { description: Invalid API key }
 */
mcpBugRouter.post("/:id/reply", async (req, res, next) => {
  try {
    const parsed = replySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const comment = await bugService.addComment({
      bugId: req.params.id,
      authorName: "Claude",
      message: parsed.data.message,
    });

    res.status(201).json({ data: comment });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /mcp/bugs/{id}/status:
 *   patch:
 *     summary: Update bug status as Claude (MCP endpoint)
 *     tags: [MCP Bugs]
 *     parameters:
 *       - in: header
 *         name: x-mcp-key
 *         required: true
 *         schema: { type: string }
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
 *       401: { description: Invalid API key }
 *       404: { description: Bug not found }
 */
mcpBugRouter.patch("/:id/status", async (req, res, next) => {
  try {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const bug = await bugService.updateBugStatus(
      req.params.id,
      parsed.data.status
    );

    await bugService.addComment({
      bugId: req.params.id,
      authorName: "Claude",
      message: `Status changed to ${parsed.data.status} by Claude`,
      isSystem: true,
    });

    res.json({ data: bug });
  } catch (err) {
    next(err);
  }
});
