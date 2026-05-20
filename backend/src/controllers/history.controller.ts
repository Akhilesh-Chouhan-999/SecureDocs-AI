import { container } from "../config/index.js";
import { success } from "../utils/apiResponse.js";

/**
 * Controller exposing historical audit logs and cross-match lookups
 */
export class HistoryController {
  static async searchHistory(req: any, res: any, next: any) {
    try {
      const result = await container.get("historyService").searchHistory(req.query, req.user);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async getHistory(req: any, res: any, next: any) {
    try {
      const result = await container.get("historyService").getHistoryByEmail(req.params.email);
      return success(res, result);
    } catch (error) { return next(error); }
  }
}
