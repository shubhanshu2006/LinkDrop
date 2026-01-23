import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { File } from "../models/file.model.js";
import { User } from "../models/user.model.js";

// Merge anonymous files to logged-in user account
export const mergeAnonymousFiles = asyncHandler(async (req, res) => {
  const loggedInUser = req.user; // From verifyJWT
  const { anonymousToken } = req.body;

  if (!anonymousToken) {
    throw new ApiError(400, "Anonymous token is required");
  }

  // Decode the anonymous token to get the anonymous user ID
  const jwt = await import("jsonwebtoken");
  let anonymousUserId;

  try {
    const decoded = jwt.default.verify(
      anonymousToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    anonymousUserId = decoded._id;
  } catch (error) {
    throw new ApiError(400, "Invalid or expired anonymous token");
  }

  // Verify that the anonymous user exists and is actually anonymous
  const anonymousUser = await User.findById(anonymousUserId);

  if (!anonymousUser) {
    throw new ApiError(404, "Anonymous user not found or files already merged");
  }

  if (!anonymousUser.isAnonymous) {
    throw new ApiError(
      400,
      "The provided token is not from an anonymous account"
    );
  }

  // Ensure logged-in user is not anonymous
  if (loggedInUser.isAnonymous) {
    throw new ApiError(400, "Cannot merge files to an anonymous account");
  }

  // Check if there are any files to merge
  const fileCount = await File.countDocuments({ owner: anonymousUserId });

  if (fileCount === 0) {
    // No files to merge, just delete the anonymous user
    await User.findByIdAndDelete(anonymousUserId);
    throw new ApiError(404, "No files found to merge");
  }

  // Transfer all files from anonymous user to logged-in user
  const result = await File.updateMany(
    { owner: anonymousUserId },
    { owner: loggedInUser._id }
  );

  // Delete the anonymous user account after successful transfer
  await User.findByIdAndDelete(anonymousUserId);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        filesTransferred: result.modifiedCount,
      },
      `Successfully merged ${result.modifiedCount} file(s) to your account`
    )
  );
});
