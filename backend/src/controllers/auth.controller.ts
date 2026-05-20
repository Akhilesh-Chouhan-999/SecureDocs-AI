import { container } from "../config.js";
import { created, success } from "../utils/apiResponse.js";

/**
 * Controller handling user registration, authentication login, profiling, and logout sessions
 */
class AuthController {
  static async register(req, res, next) {
    try {
      const result = await container.get("authService").register(req.body);
      return created(res, result);
    } catch (error) { return next(error); }
  }

  static async login(req, res, next) {
    try {
      const result = await container.get("authService").login(req.body);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async refreshToken(req, res, next) {
    try {
      const result = await container.get("authService").refresh(req.body.refreshToken);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async logout(req, res, next) {
    try {
      return success(res, { message: "Logged out successfully" });
    } catch (error) { return next(error); }
  }

  static async profile(req, res, next) {
    try {
      const profile = container.get("authService").getProfile(req.user);
      return success(res, { user: profile });
    } catch (error) { return next(error); }
  }
}

export { AuthController  };
export const default = AuthController;
