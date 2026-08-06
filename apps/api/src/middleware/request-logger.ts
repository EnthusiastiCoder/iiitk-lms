import type { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger.js";

const logger = new Logger("http");

/**
 * Log method, path, status, and duration for every request.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns void
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  res.on("finish", () => {
    logger.info("request", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
      userId: req.user?.userId,
    });
  });

  next();
}
