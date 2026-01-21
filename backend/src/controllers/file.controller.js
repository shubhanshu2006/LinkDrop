import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { File } from "../models/file.model.js";
import path from "path";
import fs from "fs";
import { canAccessFile } from "../services/fileAccess.service.js";
import {
  generateOtpForFile,
  verifyOtpForFile,
} from "../services/fileOtp.service.js";
import { sendOtpEmail } from "../utils/sendOtpMail.js";
import { listUserFiles } from "../services/file.service.js";
import { scanFileForViruses } from "../services/virusScan.service.js";
import dotenv from "dotenv";

dotenv.config();

// Controller to handle file upload
const uploadFileController = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "File is required");
  }

  const { fileType, linkExpiresAt, allowedEmail, openDuration } = req.body;

  if (!["normal", "sensitive", "verySensitive"].includes(fileType)) {
    throw new ApiError(400, "Invalid file type");
  }

  const expiresAt = new Date(linkExpiresAt);
  if (isNaN(expiresAt.getTime()) || expiresAt <= Date.now()) {
    throw new ApiError(400, "Invalid link expiry");
  }

  let downloadAllowed = true;
  let offlineAllowed = true;

  if (fileType === "sensitive") {
    downloadAllowed = false;
  }

  if (fileType === "verySensitive") {
    downloadAllowed = false;
    offlineAllowed = false;

    if (!allowedEmail || !openDuration) {
      throw new ApiError(400, "Email and open duration required");
    }
  }

  const file = await File.create({
    owner: req.user._id,
    originalName: req.file.originalname,
    storageName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    fileType,
    linkExpiresAt: expiresAt,
    allowedEmail,
    downloadAllowed,
    offlineAllowed,
  });

  // Scan file for viruses asynchronously
  scanFileForViruses(
    file._id,
    path.join(req.file.destination, req.file.filename)
  );

  res.status(201).json(
    new ApiResponse(201, {
      fileId: file._id,
      shareLink: `/files/${file._id}`,
    })
  );
});

// Controller to handle file access
const getFile = asyncHandler(async (req, res) => {
  const file = req.fileDoc; // attached by fileAccessGuard
  const user = req.user;

  const intent = "view";

  const decision = canAccessFile({
    file,
    user,
    intent,
  });

  if (!decision.allowed) {
    throw new ApiError(403, "Access denied");
  }

  const filePath = path.join(
    process.cwd(),
    "src/uploads/files",
    file.storageName
  );

  // Ensure file exists on disk
  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, "File data not found");
  }

  file.lastAccessedAt = new Date();
  file.accessCount += 1;
  await file.save({ validateBeforeSave: false });

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("X-Content-Type-Options", "nosniff");

  res.setHeader("Content-Disposition", "inline");

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

// Controller to handle OTP request
const requestFileOtp = asyncHandler(async (req, res) => {
  const file = req.fileDoc;
  const user = req.user;

  if (file.fileType !== "verySensitive") {
    throw new ApiError(400, "OTP not required for this file");
  }

  if (!user?.email || user.email.toLowerCase() !== file.allowedEmail) {
    throw new ApiError(403, "You are not allowed to request OTP for this file");
  }

  const otp = await generateOtpForFile(file);

  await sendOtpEmail(file.allowedEmail, otp);

  res.status(200).json({
    message: "OTP sent to registered email",
  });
});

// Controller to handle OTP verification
const verifyFileOtp = asyncHandler(async (req, res) => {
  const file = req.fileDoc;
  const { otp } = req.body;

  if (!otp) {
    throw new ApiError(400, "OTP is required");
  }

  if (file.fileType !== "verySensitive") {
    throw new ApiError(400, "OTP not required for this file");
  }

  await verifyOtpForFile(file, otp, file.openDuration);

  res.status(200).json({
    message: "OTP verified. Access window started.",
    accessEndsAt: file.accessEndsAt,
  });
});

// Controller to handle file download
const downloadFile = asyncHandler(async (req, res) => {
  const file = req.fileDoc;
  const user = req.user;

  const decision = canAccessFile({
    file,
    user,
    intent: "download",
  });

  if (!decision.allowed || !decision.downloadAllowed) {
    throw new ApiError(403, "Download is not allowed for this file");
  }

  if (file.maxDownloads !== null && file.accessCount >= file.maxDownloads) {
    throw new ApiError(403, "Maximum download limit reached");
  }

  const filePath = path.join(
    process.cwd(),
    "src/uploads/files",
    file.storageName
  );

  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, "File not found on server");
  }

  file.accessCount += 1;
  file.lastAccessedAt = new Date();
  await file.save({ validateBeforeSave: false });

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${file.originalName}"`
  );
  res.setHeader("X-Content-Type-Options", "nosniff");

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

// Controller to handle file deletion
const deleteFile = asyncHandler(async (req, res) => {
  const fileId = req.params.fileId;

  const file = await File.findById(fileId);

  if (!file) {
    throw new ApiError(404, "File not found");
  }
  await file.remove();

  const filePath = path.join(
    process.cwd(),
    "src/uploads/files",
    file.storageName
  );
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  res.status(200).json(new ApiResponse(200, { message: "File deleted" }));
});

// Controller to handle file settings update
const updateFileSettings = asyncHandler(async (req, res) => {
  const file = req.fileDoc;
  const { linkExpiresAt, maxDownloads } = req.body;
  if (linkExpiresAt) {
    const expiresAt = new Date(linkExpiresAt);
    if (isNaN(expiresAt.getTime()) || expiresAt <= Date.now()) {
      throw new ApiError(400, "Invalid link expiry");
    }
    file.linkExpiresAt = expiresAt;
  }

  if (maxDownloads !== undefined) {
    if (maxDownloads !== null && (isNaN(maxDownloads) || maxDownloads < 1)) {
      throw new ApiError(400, "Invalid max downloads value");
    }
    file.maxDownloads = maxDownloads;
  }
  await file.save();

  res
    .status(200)
    .json(new ApiResponse(200, { message: "File settings updated" }));
});

// Controller to list user's files with filters and pagination
const listMyFiles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, status, sort } = req.query;

  const result = await listUserFiles({
    userId: req.user._id,
    page: Number(page),
    limit: Number(limit),
    type,
    status,
    sort,
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Files fetched successfully"));
});

export {
  uploadFileController,
  getFile,
  deleteFile,
  updateFileSettings,
  requestFileOtp,
  listMyFiles,
  verifyFileOtp,
  downloadFile,
};
