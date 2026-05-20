import { Request, Response, NextFunction } from "express";

/**
 * Express middleware wrapper to catch asynchronous errors and forward them to error middleware
 * @param handler Asynchronous route handler or middleware
 */
export const asyncHandler = (handler: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
