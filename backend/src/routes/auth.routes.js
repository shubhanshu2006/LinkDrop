import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  claimAnonFiles,
  refreshAccessToken,
  verifyEmail,
  changePassword,
  forgotPassword,
  resetPassword,
  checkAnonymousFiles,
} from "../controllers/auth.controller.js";
import { mergeAnonymousFiles } from "../controllers/mergeAnonymousFiles.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { anonymousAuth } from "../middlewares/anonymous.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Session management
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(verifyJWT, logoutUser);

// User routes
router.route("/me").get(verifyJWT, getCurrentUser);

// Claim anonymous files
router.route("/claim-anon-files").post(anonymousAuth, claimAnonFiles);

// Merge anonymous files to logged-in account
router.route("/merge-anon-files").post(verifyJWT, mergeAnonymousFiles);

// Check if anonymous files exist
router.route("/check-anon-files").post(checkAnonymousFiles);

// Email verification
router.route("/verify-email").get(verifyEmail);

// Password management
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

export default router;
