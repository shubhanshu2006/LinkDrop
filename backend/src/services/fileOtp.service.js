import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";

// Function to generate OTP for a file
export const generateOtpForFile = async (file) => {
  if (file.isOpened) {
    throw new ApiError(403, "OTP can no longer be generated for this file");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  file.otpHash = otpHash;
  file.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  file.otpAttempts = 0;

  await file.save({ validateBeforeSave: false });

  return otp;
};

// Function to verify OTP for a file
export const verifyOtpForFile = async (file, otp, openDurationMinutes) => {
  if (!file.otpHash || !file.otpExpiresAt) {
    throw new ApiError(400, "No OTP request found");
  }

  if (file.otpExpiresAt < new Date()) {
    throw new ApiError(400, "OTP has expired");
  }

  if (!openDurationMinutes || openDurationMinutes <= 0) {
    throw new ApiError(400, "Invalid open duration");
  }

  const hashedInput = crypto.createHash("sha256").update(otp).digest("hex");

  if (hashedInput !== file.otpHash) {
    file.otpAttempts += 1;
    await file.save({ validateBeforeSave: false });
    throw new ApiError(400, "Invalid OTP");
  }

  // OTP verified successfully
  const now = new Date();

  file.otpVerifiedAt = now;
  file.isOpened = true;
  file.accessEndsAt = new Date(now.getTime() + openDurationMinutes * 60 * 1000);

  // Clear OTP fields
  file.otpHash = undefined;
  file.otpExpiresAt = undefined;

  await file.save({ validateBeforeSave: false });
};
