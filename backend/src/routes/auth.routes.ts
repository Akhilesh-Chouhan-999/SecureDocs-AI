import { Router } from "express";
import { AuthController } from "../controllers.js";
import { authMiddleware, validate } from "../middleware.js";
import { authValidators } from "../validators.js";

const router = Router();

router.post("/register", validate(authValidators.register), AuthController.register);
router.post("/login", validate(authValidators.login), AuthController.login);
router.post("/refresh-token", validate(authValidators.refreshToken), AuthController.refreshToken);
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/profile", authMiddleware, AuthController.profile);

export default router;
