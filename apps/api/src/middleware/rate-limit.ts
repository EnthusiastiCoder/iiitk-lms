import rateLimit from "express-rate-limit";

/** Rate limiter for auth endpoints: 10 requests per 60 seconds per IP. */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many attempts, try again later", code: "RATE_LIMITED", status: 429 } },
});

/** General API limiter: 100 requests per 60 seconds per IP. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many requests", code: "RATE_LIMITED", status: 429 } },
});
