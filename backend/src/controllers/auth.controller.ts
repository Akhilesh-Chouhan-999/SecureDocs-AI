import type { Request, Response, NextFunction } from "express";
import { container } from "../config";
import { created, success } from "../utils/apiResponse";

/**
 * Controller handling user registration, authentication login, profiling, and logout sessions
 */
export class AuthController {
  /**
   * Signup handler
   * @param req Express request
   * @param res Express response
   * @param next Next middleware function
   */
  public static async register(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await container.get("authService").register(req.body);
      return created(res, result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Credentials validation handler
   * @param req Express request
   * @param res Express response
   * @param next Next middleware function
   */
  public static async login(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await container.get("authService").login(req.body);
      return success(res, result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Session refresh token validation handler
   * @param req Express request
   * @param res Express response
   * @param next Next middleware function
   */
  public static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await container.get("authService").refresh(req.body.refreshToken);
      return success(res, result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Terminate active analyst session
   * @param req Express request
   * @param res Express response
   * @param next Next middleware function
   */
  public static async logout(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return success(res, { message: "Logged out successfully" });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Fetch profiles payloads of logged-in credentials context
   * @param req Express request containing validated user
   * @param res Express response
   * @param next Next middleware function
   */
  public static async profile(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const profile = container.get("authService").getProfile(req.user);
      return success(res, { user: profile });
    } catch (error) {
      return next(error);
    }
  }
}

export default AuthController;
