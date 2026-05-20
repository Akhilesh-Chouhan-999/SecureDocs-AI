import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../config/env";
import { AuthError, ValidationError } from "../errors";
import { signAccessToken, signRefreshToken } from "../utils/tokens";
import { sanitizeUser } from "../domain/entities";
import type { UserRepository } from "../repositories/user.repository";

/**
 * Service orchestrating authentication flows (login, register, token refresh)
 */
export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Register a new user
   * @param data User signup field payload
   */
  public async register(data: any): Promise<any> {
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
  public async login({ email, password }: any): Promise<any> {
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
  public async refresh(refreshToken: string): Promise<any> {
    try {
      const decoded = jwt.verify(refreshToken, env.refreshTokenSecret) as { userId: string };
      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        throw new AuthError("Invalid refresh token");
      }

      return {
        token: signAccessToken(user),
        refreshToken: signRefreshToken(user),
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError("Invalid refresh token");
    }
  }

  /**
   * Get sanitized profiles payload
   * @param user The logged-in user db instance
   */
  public getProfile(user: any): any {
    return sanitizeUser(user);
  }
}

export default AuthService;
