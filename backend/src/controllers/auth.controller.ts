import { container } from "../config/index.js";
import { created, success } from "../utils/apiResponse.js";

/**
 * Controller handling user registration, authentication login, profiling, and logout sessions
 */
export class AuthController {
  static async register(req: any, res: any, next: any) {
    try {
      const result = await container.get("authService").register(req.body);
      return created(res, result);
    } catch (error) { return next(error); }
  }

  static async login(req: any, res: any, next: any) {
    try {
      const result = await container.get("authService").login(req.body);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async refreshToken(req: any, res: any, next: any) {
    try {
      const result = await container.get("authService").refresh(req.body.refreshToken);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async logout(_req: any, res: any, next: any) {
    try {
      return success(res, { message: "Logged out successfully" });
    } catch (error) { return next(error); }
  }

  static async profile(req: any, res: any, next: any) {
    try {
      const profile = container.get("authService").getProfile(req.user);
      return success(res, { user: profile });
    } catch (error) { return next(error); }
  }
}
