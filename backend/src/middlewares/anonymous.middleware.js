import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const anonymousAuth = asyncHandler(async (req, res, next) => {
  // PRIORITY 1: Check for logged-in user token first (highest priority)
  const token =
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.cookies?.accessToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decoded._id).select(
        "-password -refreshToken"
      );

      if (user && !user.isAnonymous) {
        // Valid logged-in user - don't create/use anonymous token
        req.user = user;
        return next();
      }
    } catch {
      // invalid token, continue checking other auth methods
    }
  }

  // PRIORITY 2: Check if there's an existing anonymous session
  const anonToken = req.cookies?.anonAccessToken;

  if (anonToken) {
    try {
      const decoded = jwt.verify(anonToken, process.env.ACCESS_TOKEN_SECRET);
      const anonUser = await User.findById(decoded._id).select(
        "-password -refreshToken"
      );

      if (anonUser && anonUser.isAnonymous) {
        // Send existing token in header too
        res.setHeader("X-Anonymous-Token", anonToken);
        req.user = anonUser;
        return next();
      }
    } catch {
      // Invalid anonymous token, create new one
    }
  }

  // Create new anonymous user
  const anonymousUser = await User.create({ isAnonymous: true });

  // Issue short-lived access token for anonymous user
  const newAnonToken = jwt.sign(
    { _id: anonymousUser._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // Store anonymous token in a separate cookie to avoid conflicts
  res.cookie("anonAccessToken", newAnonToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Also send token in response header for frontend to save in localStorage
  res.setHeader("X-Anonymous-Token", newAnonToken);

  req.user = anonymousUser;
  next();
});
