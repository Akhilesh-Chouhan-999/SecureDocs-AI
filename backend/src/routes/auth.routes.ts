import { Router } from "express";
import { AuthController } from "../controllers/index.js";
import { authMiddleware, validate } from "../middleware/index.js";
import { authValidators } from "../validators/index.js";

const router = Router();

router.post(
  "/register",
  validate(authValidators.register),
  AuthController.register,
);
router.post("/login", validate(authValidators.login), AuthController.login);
router.post(
  "/refresh-token",
  validate(authValidators.refreshToken),
  AuthController.refreshToken,
);
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/profile", authMiddleware, AuthController.profile);

export default router;
