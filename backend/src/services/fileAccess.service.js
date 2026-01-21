import { ApiError } from "../utils/ApiError.js";

/**
 * Decide whether a file can be accessed.
 *
 * @param {Object} params
 * @param {Object} params.file - File document (from DB)
 * @param {Object} params.user - Current user (anonymous or logged-in)
 * @param {String} params.intent - "view" | "download" | "offline"
 *
 * @returns {Object} decision
 */

// Function to decide file access permissions
export const canAccessFile = ({ file, user, intent = "view" }) => {
  const now = new Date();

  if (file.fileType === "normal") {
    return {
      allowed: true,
      downloadAllowed: true,
      offlineAllowed: true,
    };
  }

  if (file.fileType === "sensitive") {
    if (file.linkexpiredAt <= now) {
      throw new ApiError(403, "Link has expired for this file");
    }

    if (intent === "download") {
      throw new ApiError(403, "Download is not allowed for this file");
    }

    if (intent === "offline") {
      return {
        allowed: true,
        downloadAllowed: false,
        offlineAllowed: true,
      };
    }

    return {
      allowed: true,
      downloadAllowed: false,
      offlineAllowed: true,
    };
  }

  if (file.fileType === "verySensitive") {
    if (!user?.email || user.email.toLowerCase() !== file.allowedEmail) {
      throw new ApiError(403, "You are not allowed to access this file");
    }

    if (!file.otpVerifiedAt) {
      throw new ApiError(401, "OTP verification required");
    }

    if (!file.accessEndsAt || file.accessEndsAt <= now) {
      throw new ApiError(423, "Access window has expired");
    }

    if (intent === "download" || intent === "offline") {
      throw new ApiError(403, "Download is not allowed for this file");
    }

    return {
      allowed: true,
      downloadAllowed: false,
      offlineAllowed: false,
    };
  }

  throw new ApiError(400, "Invalid file access configuration");
};
