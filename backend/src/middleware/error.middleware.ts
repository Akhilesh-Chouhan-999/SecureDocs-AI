import type { Request, Response, NextFunction } from "express";

/**
 * Global error handling middleware to catch all operational and programming errors
 * and format them into consistent JSON responses.
 */
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  const statusCode = err.statusCode || err.status || 500;
  const payload: {
    success: false;
    error: {
      code: string;
      message: string;
      details?: unknown;
      stack?: string;
    };
  } = {
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Internal server error",
    },
  };

  if (err.details) {
    payload.error.details = err.details;
  }

  if (process.env.NODE_ENV === "development") {
    payload.error.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
};

export default errorMiddleware;
