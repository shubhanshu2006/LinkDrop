import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const anonymousAuth = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decoded._id).select(
        "-password -refreshToken"
      );

      if (user) {
        req.user = user;
        return next();
      }
    } catch {
      // invalid token, continue as anonymous
    }
  }

  // No valid token create anonymous user
  const anonymousUser = await User.create({ isAnonymous: true });

  // Issue short-lived access token for anonymous user
  const anonToken = jwt.sign(
    { _id: anonymousUser._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("accessToken", anonToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  req.user = anonymousUser;
  next();
});
