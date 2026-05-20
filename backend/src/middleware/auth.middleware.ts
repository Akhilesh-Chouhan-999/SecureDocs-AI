const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { User } = require("../infrastructure/database/models");
const { AuthError } = require("../errors");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AuthError("Unauthorized: No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, env.jwtSecret);
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

module.exports = authMiddleware;
