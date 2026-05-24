import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";
import { AuthError } from "../errors/index.js";

const authMiddleware = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AuthError("Unauthorized: No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded: any = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {

      return next(new AuthError("Unauthorized: Invalid token"));
    }

    req.user = user;
    next();
    
  } catch (error) {
    return next(new AuthError("Unauthorized: Invalid token"));
  }
};

export default authMiddleware;
