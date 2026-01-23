import bcrypt from "bcrypt";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { File } from "../models/file.model.js";
import { generateAccessAndRefreshTokens } from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";
import { PendingUser } from "../models/pendingUser.model.js";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.js";

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    throw new ApiError(400, "Email, Password, and Full Name are required");
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const blockedDomains = [
    "mailinator.com",
    "10minutemail.com",
    "tempmail.com",
    "guerrillamail.com",
  ];

  const emailDomain = email.split("@")[1]?.toLowerCase();

  if (blockedDomains.includes(emailDomain)) {
    throw new ApiError(400, "Validation failed", {
      email: "Disposable email addresses are not allowed",
    });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$/;

  if (!passwordRegex.test(password)) {
    
    const errors = [];
    if (password.length < 8) errors.push("at least 8 characters");
    if (!/[a-z]/.test(password)) errors.push("one lowercase letter");
    if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
    if (!/\d/.test(password)) errors.push("one number");
    if (!/[@$!%*?&#_]/.test(password)) errors.push("one special character");

    const message =
      errors.length > 0
        ? `Password must contain ${errors.join(", ")}`
        : "Password does not meet security requirements";

    throw new ApiError(400, message);
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const existingPendingUser = await PendingUser.findOne({ email });
  if (existingPendingUser) {
    throw new ApiError(409, "A verification email has already been sent");
  }

  // Create a pending user
  const rawToken = crypto.randomBytes(32).toString("hex");
  const verificationToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await PendingUser.create({
    email,
    fullName,
    password: hashedPassword,
    verificationToken,
    verificationExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  await sendVerificationEmail(email, fullName, rawToken);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        {},
        "Registration successful! Please check your email to verify your account."
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and Password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(
      401,
      "No account found with this email address. Please register first."
    );
  }

  if (user.isAnonymous) {
    throw new ApiError(403, "Please register to login");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Incorrect password. Please try again or reset your password."
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!safeUser) {
    throw new ApiError(500, "Failed to retrieve user data");
  }

  res
    .status(200)
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .clearCookie("anonAccessToken") // Clear anonymous token on login
    .json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          accessToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("anonAccessToken") // Clear anonymous token on logout
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }
  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req.user,
      },
      "Current user fetched successfully"
    )
  );
});

const claimAnonFiles = asyncHandler(async (req, res) => {
  const anonUser = req.user;
  const { email, password, fullName } = req.body;

  //  Safety check
  if (!anonUser) {
    throw new ApiError(401, "Unauthorized");
  }

  //  Validate input
  if (!email || !password || !fullName) {
    throw new ApiError(400, "Email, password and full name are required");
  }

  //  Ensure user is anonymous
  if (!anonUser.isAnonymous) {
    throw new ApiError(400, "User is already registered");
  }

  //  Prevent duplicate accounts
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  //  Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  //  Convert anonymous to registered
  anonUser.email = email;
  anonUser.password = hashedPassword;
  anonUser.fullName = fullName;
  anonUser.isAnonymous = false;

  await anonUser.save({ validateBeforeSave: false });

  // Issue tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    anonUser._id
  );

  // Prepare safe user
  const safeUser = await User.findById(anonUser._id).select(
    "-password -refreshToken"
  );

  // Respond
  res
    .status(200)
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .clearCookie("anonAccessToken") // Clear anonymous token after claiming files
    .json(
      new ApiResponse(
        200,
        { user: safeUser, accessToken },
        "Anonymous files claimed successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new ApiError(401, "Refresh token missing");
  }

  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decoded._id);

  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .json(
      new ApiResponse(200, { accessToken, user: safeUser }, "Token refreshed")
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ApiError(400, "Verification token missing");
  }

  // Hash the token received from email
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find pending user with valid token
  const pendingUser = await PendingUser.findOne({
    verificationToken: hashedToken,
    verificationExpiresAt: { $gt: Date.now() },
  });

  if (!pendingUser) {
    throw new ApiError(400, "Verification link is invalid or expired");
  }

  // Create verified user
  await User.create({
    email: pendingUser.email,
    fullName: pendingUser.fullName,
    password: pendingUser.password,
    isAnonymous: false,
  });

  // Remove pending user
  await PendingUser.deleteOne({ _id: pendingUser._id });

  // Redirect to frontend with success message
  res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new passwords are required");
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$/;

  if (!passwordRegex.test(newPassword)) {
    throw new ApiError(
      400,
      "New password does not meet complexity requirements"
    );
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedNewPassword;

  user.refreshToken = undefined;

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If an account with that email exists, a password reset email has been sent."
        )
      );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedResetToken;
  user.resetPasswordExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await sendResetPasswordEmail(user.email, user.fullName, resetUrl);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset email sent successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, "Token and password are required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Reset token is invalid or has expired");
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$/;

  if (!passwordRegex.test(password)) {
    throw new ApiError(400, "Password does not meet complexity requirements");
  }

  const hashedNewPassword = await bcrypt.hash(password, 10);

  user.password = hashedNewPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  user.refreshToken = undefined;

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password has been reset successfully"));
});

// Check if anonymous user has files
const checkAnonymousFiles = asyncHandler(async (req, res) => {
  const { anonymousToken } = req.body;

  if (!anonymousToken) {
    throw new ApiError(400, "Anonymous token is required");
  }

  // Decode the anonymous token to get the anonymous user ID
  let anonymousUserId;

  try {
    const decoded = jwt.verify(anonymousToken, process.env.ACCESS_TOKEN_SECRET);
    anonymousUserId = decoded._id;
  } catch (error) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          hasFiles: false,
          fileCount: 0,
          anonymousUserExists: false,
        },
        "Invalid or expired anonymous token"
      )
    );
  }

  // Check if anonymous user exists
  const anonymousUser = await User.findById(anonymousUserId);

  if (!anonymousUser || !anonymousUser.isAnonymous) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          hasFiles: false,
          fileCount: 0,
          anonymousUserExists: false,
        },
        "Anonymous user not found or files already merged"
      )
    );
  }

  // Count files owned by anonymous user
  const fileCount = await File.countDocuments({ owner: anonymousUserId });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        hasFiles: fileCount > 0,
        fileCount,
        anonymousUserExists: true,
      },
      fileCount > 0
        ? `Found ${fileCount} file(s) to merge`
        : "No files to merge"
    )
  );
});

export {
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
};
