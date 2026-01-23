import { File } from "../models/file.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Middleware to guard file access based on various conditions
export const fileAccessGuard = asyncHandler(async (req, res, next) => {
  const { fileId } = req.params;

  if (!fileId) {
    throw new ApiError(400, "File ID is required");
  }

  const file = await File.findById(fileId);

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  if (file.isDisabled) {
    throw new ApiError(403, file.disabledReason || "This file is disabled");
  }

  const now = new Date();

  if (file.linkExpiresAt && file.linkExpiresAt <= now) {
    throw new ApiError(410, "This file link has expired");
  }

  if (
    file.fileType === "verySensitive" &&
    file.isOpened &&
    file.accessEndsAt &&
    file.accessEndsAt <= now
  ) {
    throw new ApiError(423, "This file is permanently locked");
  }

  req.fileDoc = file;

  next();
});
