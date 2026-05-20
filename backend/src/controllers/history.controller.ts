import { container } from "../config.js";
import { success } from "../utils/apiResponse.js";

/**
 * Controller exposing historical audit logs and cross-match lookups
 */
class HistoryController {
  static async searchHistory(req, res, next) {
    try {
      const result = await container.get("historyService").searchHistory(req.query, req.user);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async getHistory(req, res, next) {
    try {
      const result = await container.get("historyService").getHistoryByEmail(req.params.email);
      return success(res, result);
    } catch (error) { return next(error); }
  }
}

export { HistoryController  };
export const default = HistoryController;
