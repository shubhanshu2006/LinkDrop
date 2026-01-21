import { Router } from "express";
import {
  uploadFileController,
  getFile,
  deleteFile,
  updateFileSettings,
  requestFileOtp,
  verifyFileOtp,
  downloadFile,
} from "../controllers/file.controller.js";
import { uploadFile } from "../middlewares/upload.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { anonymousAuth } from "../middlewares/anonymous.middleware.js";
import { fileAccessGuard } from "../middlewares/fileAccessGuard.middleware.js";
import { listMyFiles } from "../controllers/file.controller.js";

const router = Router();

// Route for file upload
router
  .route("/upload")
  .post(anonymousAuth, uploadFile.single("file"), uploadFileController);

// Route for file access and management
router.route("/:fileId").get(anonymousAuth, fileAccessGuard, getFile);

// Routes for OTP request
router
  .route("/:fileId/request-otp")
  .post(anonymousAuth, fileAccessGuard, requestFileOtp);

// Route for OTP verification
router
  .route("/:fileId/verify-otp")
  .post(anonymousAuth, fileAccessGuard, verifyFileOtp);

// Route for file download
router
  .route("/:fileId/download")
  .get(anonymousAuth, fileAccessGuard, downloadFile);

// Route for file deletion
router.route("/:fileId").delete(verifyJWT, deleteFile);

// Route for updating file settings
router.route("/:fileId/settings").patch(verifyJWT, updateFileSettings);

// Route for listing user's files
router.route("/my").get(verifyJWT, listMyFiles);

export default router;
