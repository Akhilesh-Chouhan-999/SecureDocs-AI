import jwt from "jsonwebtoken";
import env from "../config/env.js";

/**
 * Generate a JWT access token for a user session
 * @param user The user object containing id, email, and role
 */
export const signAccessToken = (user: any) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret as string,
    { expiresIn: env.jwtExpiry as any },
  );
};

/**
 * Generate a JWT refresh token for session renewals
 * @param user The user object containing id
 */
export const signRefreshToken = (user: any) => {
  return jwt.sign(
    {
      userId: user._id,
      tokenType: "refresh",
    },
    env.refreshTokenSecret as string,
    { expiresIn: env.refreshTokenExpiry as any },
  );
};

export const tokens = {
  signAccessToken,
  signRefreshToken,
};
