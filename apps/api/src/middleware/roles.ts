import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

type Role = "student" | "professor" | "admin";

/**
 * Factory: returns middleware that requires one of the given roles.
 * @param roles - Roles that are allowed to access the route
 * @returns Express middleware that enforces the role check
 */
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

/** Middleware allowing student, professor, and admin roles. */
export const requireStudent = requireRole("student", "professor", "admin");
/** Middleware allowing professor and admin roles. */
export const requireProfessor = requireRole("professor", "admin");
/** Middleware allowing only the admin role. */
export const requireAdmin = requireRole("admin");
