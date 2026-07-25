import { Router } from "express";
import {
  signupUser,
  verifyEmail,
  resendVerification,
  loginUser,
  logoutUser,
  logoutAllDevices,
  getActiveSessions,
  getCurrentUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(signupUser);
router.route("/verify-email").post(verifyEmail);
router.route("/resend-verification").post(resendVerification);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/logout-all").post(verifyJWT, logoutAllDevices); // Logout from all devices
router.route("/sessions").get(verifyJWT, getActiveSessions); // Get all active sessions
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/refresh").post(refreshAccessToken);
router.route("/forgot-password").post(forgotPassword); // Request password reset
router.route("/reset-password").post(resetPassword); // Reset password with token
router.route("/update-password").post(verifyJWT, updatePassword); // Change password (logged in)

export default router;
