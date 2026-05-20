import jwt from "jsonwebtoken";
import env from "../config/env";

/**
 * Generate a JWT access token for a user session
 * @param user The user object containing id, email, and role
 */
export const signAccessToken = (user: { _id: unknown; email: string; role: string }): string => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiry },
  );
};

/**
 * Generate a JWT refresh token for session renewals
 * @param user The user object containing id
 */
export const signRefreshToken = (user: { _id: unknown }): string => {
  return jwt.sign(
    {
      userId: user._id,
      tokenType: "refresh",
    },
    env.refreshTokenSecret,
    { expiresIn: env.refreshTokenExpiry },
  );
};

export const tokens = {
  signAccessToken,
  signRefreshToken,
};

export default tokens;
