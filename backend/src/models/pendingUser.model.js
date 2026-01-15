import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  verificationToken: {
    type: String,
    required: true,
  },

  verificationExpiresAt: {
    type: Date,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24, // auto delete after 24 hours
  },
});

export const PendingUser = mongoose.model(
  "PendingUser",
  pendingUserSchema
);
