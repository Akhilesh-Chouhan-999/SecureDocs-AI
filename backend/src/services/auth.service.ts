import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { AuthError, ValidationError } from "../errors/index.js";
import { signAccessToken, signRefreshToken } from "../utils/tokens.js";
import { sanitizeUser } from "../domain/entities/index.js";

/**
 * Service orchestrating authentication flows (login, register, token refresh)
 */
export class AuthService {

  private userRepository: any;

  constructor(userRepository: any) {
    this.userRepository = userRepository;
  }

  /**
   * Register a new user
   * @param data User signup field payload
   */
  async register(data: any) {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ValidationError("User already exists", { email: data.email });
    }

    const user = await this.userRepository.create(data);

    return {
      user: sanitizeUser(user),
      token: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    };
  }

  /**
   * Log in an existing user verifying password hash matches
   * @param credentials User email and password credentials
   */
  async login({ email, password }: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AuthError("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AuthError("Invalid credentials");
    }

    return {
      user: sanitizeUser(user),
      token: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    };
  }

  /**
   * Refresh session tokens verifying validity of refresh token signature
   * @param refreshToken Signed refresh token string
   */
  async refresh(refreshToken: string) {
    try {
      const decoded: any = jwt.verify(refreshToken, env.refreshTokenSecret);
      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        throw new AuthError("Invalid refresh token");
      }

      return {
        token: signAccessToken(user),
        refreshToken: signRefreshToken(user),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Invalid refresh token");
    }
  }

  /**
   * Get sanitized profiles payload
   * @param user The logged-in user db instance
   */
  getProfile(user: any) {
    return sanitizeUser(user);
  }

}
