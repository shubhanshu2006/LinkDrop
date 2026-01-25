import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { File } from "../models/file.model.js";
import { supabase } from "../config/supabase.js";
import crypto from "crypto";
import { canAccessFile } from "../services/fileAccess.service.js";
import {
  generateOtpForFile,
  verifyOtpForFile,
} from "../services/fileOtp.service.js";
import { sendOtpEmail } from "../utils/sendOtpMail.js";
import { listUserFiles } from "../services/file.service.js";
import { Readable } from "stream";
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

  const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeName = sanitizeFilename(req.file.originalname);

  // Upload to Supabase
  const fileKey = `uploads/${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage
    .from("files")
    .upload(fileKey, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new ApiError(500, error.message);
  }

  const { data } = supabase.storage.from("files").getPublicUrl(fileKey);

  const file = await File.create({
    owner: req.user._id,
    originalName: req.file.originalname,
    storageName: fileKey,
    fileUrl: data.publicUrl,
    mimeType: req.file.mimetype,
    size: req.file.size,
    fileType,
    linkExpiresAt: expiresAt,
    allowedEmail,
    openDuration: openDuration ? parseInt(openDuration) : undefined,
    downloadAllowed,
    offlineAllowed,
  });

  res.status(201).json(
    new ApiResponse(201, {
      fileId: file._id,
      shareLink: `/files/${file._id}`,
    })
  );
});

// Controller to get file content
const getFile = asyncHandler(async (req, res) => {
  const file = req.fileDoc;

  const decision = canAccessFile({
    file,
    user: req.user,
    intent: "view",
  });

  if (!decision.allowed) {
    throw new ApiError(403, "Access denied");
  }

  if (file.accessEndsAt && new Date() > file.accessEndsAt) {
    throw new ApiError(403, "Access window expired");
  }

  const { data, error } = await supabase.storage
    .from("files")
    .download(file.storageName);

  if (error || !data) {
    throw new ApiError(500, "Failed to fetch file from storage");
  }

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const buffer = Buffer.from(await data.arrayBuffer());
  Readable.from(buffer).pipe(res);

  file.lastAccessedAt = new Date();
  file.accessCount += 1;
  await file.save({ validateBeforeSave: false });
});

// Controller to get file metadata (info)
const getFileInfo = asyncHandler(async (req, res) => {
  const file = req.fileDoc; // attached by fileAccessGuard
  const user = req.user;

  const intent = "info";

  const decision = canAccessFile({
    file,
    user,
    intent,
  });

  if (!decision.allowed) {
    throw new ApiError(403, "Access denied");
  }

  // Return file metadata
  res.status(200).json(
    new ApiResponse(200, {
      file: {
        _id: file._id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        fileType: file.fileType,
        downloadAllowed: file.downloadAllowed,
        offlineAllowed: file.offlineAllowed,
        linkExpiresAt: file.linkExpiresAt,
        uploadedBy: file.owner,
        accessCount: file.accessCount,
        lastAccessedAt: file.lastAccessedAt,
        otpVerifiedAt: file.otpVerifiedAt,
        isOpened: file.isOpened,
        accessEndsAt: file.accessEndsAt,
        allowedEmail: file.allowedEmail,
        openDuration: file.openDuration,
      },
      serverTime: new Date(),
    })
  );
});

// Controller to handle OTP request
const requestFileOtp = asyncHandler(async (req, res) => {
  const file = req.fileDoc;

  if (file.fileType !== "verySensitive") {
    throw new ApiError(400, "OTP not required for this file");
  }

  const otp = await generateOtpForFile(file);

  await sendOtpEmail(file.allowedEmail, otp);

  res
    .status(200)
    .json(new ApiResponse(200, {}, `OTP sent to ${file.allowedEmail}`));
});

// Controller to handle OTP verification
const verifyFileOtp = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { otp } = req.body;

  if (!otp) {
    throw new ApiError(400, "OTP is required");
  }

  const file = await File.findById(fileId).select("+otpHash");

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  if (file.fileType !== "verySensitive") {
    throw new ApiError(400, "OTP not required for this file");
  }

  await verifyOtpForFile(file, otp, file.openDuration);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        accessEndsAt: file.accessEndsAt,
        serverTime: new Date(),
      },
      "OTP verified. Access window started."
    )
  );
});

// Controller to handle file download
const downloadFile = asyncHandler(async (req, res) => {
  const file = req.fileDoc;
  const intent = req.query.intent || "download";

  const decision = canAccessFile({
    file,
    user: req.user,
    intent,
  });

  if (intent === "offline" && !decision.offlineAllowed) {
    throw new ApiError(403, "Offline save not allowed");
  }

  if (intent === "download" && !decision.downloadAllowed) {
    throw new ApiError(403, "Download not allowed");
  }

  if (file.accessEndsAt && new Date() > file.accessEndsAt) {
    throw new ApiError(403, "Access window expired");
  }

  const { data, error } = await supabase.storage
    .from("files")
    .download(file.storageName);

  if (error || !data) {
    throw new ApiError(500, "Failed to fetch file from storage");
  }

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${file.originalName}"`
  );
  res.setHeader("X-Content-Type-Options", "nosniff");

  const buffer = Buffer.from(await data.arrayBuffer());
  Readable.from(buffer).pipe(res);

  file.lastAccessedAt = new Date();
  file.accessCount += 1;
  await file.save({ validateBeforeSave: false });
});

// Controller to handle file deletion
const deleteFile = asyncHandler(async (req, res) => {
  const fileId = req.params.fileId;

  const file = await File.findById(fileId);

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  await supabase.storage.from("files").remove([file.storageName]);
  await file.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, "File deleted successfully"));
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
  getFileInfo,
  deleteFile,
  updateFileSettings,
  requestFileOtp,
  listMyFiles,
  verifyFileOtp,
  downloadFile,
};
