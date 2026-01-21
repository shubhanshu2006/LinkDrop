import fs from "fs";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { File } from "../models/file.model.js";
import { listAllFiles } from "../services/adminFile.service.js";

const FILES_DIR = path.join(process.cwd(), "src/uploads/files");

// List all files
export const adminListFiles = asyncHandler(async (req, res) => {
  const { page, limit, type, status, owner, sort } = req.query;

  const result = await listAllFiles({
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    type,
    status,
    owner,
    sort,
  });

  res.status(200).json(new ApiResponse(200, result));
});

// Disable file
export const disableFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.fileId);

  if (!file) throw new ApiError(404, "File not found");

  file.isDisabled = true;
  file.disabledReason = req.body.reason || "Disabled by admin";
  await file.save({ validateBeforeSave: false });

  res.json(new ApiResponse(200, {}, "File disabled"));
});

// Enable file
export const enableFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.fileId);

  if (!file) throw new ApiError(404, "File not found");

  file.isDisabled = false;
  file.disabledReason = undefined;
  await file.save({ validateBeforeSave: false });

  res.json(new ApiResponse(200, {}, "File enabled"));
});

// Delete file permanently
export const deleteFilePermanently = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.fileId);

  if (!file) throw new ApiError(404, "File not found");

  const filePath = path.join(FILES_DIR, file.storageName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await file.deleteOne();

  res.json(new ApiResponse(200, {}, "File deleted permanently"));
});
