import type { Response, NextFunction } from "express";
import { container } from "../config";
import { success } from "../utils/apiResponse";

/**
 * Controller exposing historical audit logs and cross-match lookups
 */
export class HistoryController {
  /**
   * Search through database-backed analysis submissions history
   * @param req Express request
   * @param res Express response
   * @param next Next middleware function
   */
  public static async searchHistory(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await container
        .get("historyService")
        .searchHistory(req.query, req.user);

      return success(res, result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Fetch specific historical matches profile keying off email address
   * @param req Express request containing email path param
   * @param res Express response
   * @param next Next middleware function
   */
  public static async getHistory(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await container
        .get("historyService")
        .getHistoryByEmail(req.params.email);

      return success(res, result);
    } catch (error) {
      return next(error);
    }
  }
}

export default HistoryController;
