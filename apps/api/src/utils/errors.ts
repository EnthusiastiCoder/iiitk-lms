/** Base application error with HTTP status code and machine-readable code. */
export class AppError extends Error {
  /**
   * @param statusCode - HTTP status code to send in the response
   * @param message - Human-readable error message
   * @param code - Machine-readable error code
   */
  constructor(
    public statusCode: number,
    message: string,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** 400 Bad Request error. */
export class BadRequestError extends AppError {
  /**
   * @param message - Description of what was invalid in the request
   */
  constructor(message: string) {
    super(400, message, "BAD_REQUEST");
  }
}

/** 401 Unauthorized error. */
export class UnauthorizedError extends AppError {
  /**
   * @param message - Reason authentication failed
   */
  constructor(message = "Authentication required") {
    super(401, message, "UNAUTHORIZED");
  }
}

/** 403 Forbidden error. */
export class ForbiddenError extends AppError {
  /**
   * @param message - Reason access was denied
   */
  constructor(message = "Insufficient permissions") {
    super(403, message, "FORBIDDEN");
  }
}

/** 404 Not Found error. */
export class NotFoundError extends AppError {
  /**
   * @param resource - Name of the resource that was not found
   */
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND");
  }
}

/** 409 Conflict error. */
export class ConflictError extends AppError {
  /**
   * @param message - Description of the conflict
   */
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}

/** 429 Rate Limit error. */
export class RateLimitError extends AppError {
  /**
   * @param message - Rate limit explanation
   */
  constructor(message = "Too many requests") {
    super(429, message, "RATE_LIMITED");
  }
}
