import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

type Role = "student" | "professor" | "admin";

/** Factory: returns middleware that requires one of the given roles. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError(`Requires role: ${roles.join(" or ")}`));
      return;
    }
    next();
  };
}

export const requireStudent = requireRole("student", "professor", "admin");
export const requireProfessor = requireRole("professor", "admin");
export const requireAdmin = requireRole("admin");
