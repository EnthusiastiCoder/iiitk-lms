import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger("error-handler");

/** Global error handler — must be registered last. */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn("app_error", {
      path: req.path,
      method: req.method,
      status: err.statusCode,
      code: err.code,
      message: err.message,
    });

    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        status: err.statusCode,
      },
    });
    return;
  }

  logger.error("unhandled_error", err, {
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
      status: 500,
    },
  });
}
