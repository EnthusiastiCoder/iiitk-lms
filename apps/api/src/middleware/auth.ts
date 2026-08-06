import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

export interface AuthPayload {
  userId: string;
  role: "student" | "professor" | "admin";
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Extract and verify JWT from Authorization header.
 * @param req - Express request object
 * @param _res - Express response object (unused)
 * @param next - Express next function
 * @returns void
 * @throws {UnauthorizedError} If the token is missing, invalid, or expired
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing authorization token"));
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}
