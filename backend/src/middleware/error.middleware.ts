/**
 * Global error handling middleware to catch all operational and programming errors
 * and format them into consistent JSON responses.
 */
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const payload = {
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

export { errorMiddleware  };
export const default = errorMiddleware;
