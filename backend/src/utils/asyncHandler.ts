import type { Request, Response, NextFunction } from "express";

/**
 * Express middleware wrapper to catch asynchronous errors and forward them to error middleware
 * @param handler Asynchronous route handler or middleware
 */
export const asyncHandler = (
  handler: (req: any, res: Response, next: NextFunction) => unknown | Promise<unknown>,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

export default asyncHandler;
