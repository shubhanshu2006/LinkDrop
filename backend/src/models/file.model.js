import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    // Ownership
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // File meta data
    originalName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    storageName: {
      type: String,
      required: true,
      unique: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    // File security type
    fileType: {
      type: String,
      enum: ["normal", "sensitive", "verySensitive"],
      required: true,
    },

    // Link expiry (applies to all types)
    linkExpiresAt: {
      type: Date,
      required: true,
    },

    // VERY SENSITIVE FILE FIELDS

    allowedEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    openDuration: {
      type: Number,
      // Duration in minutes for how long the file can be accessed after OTP verification
    },

    otpHash: {
      type: String,
      select: false,
    },

    otpExpiresAt: {
      type: Date,
    },

    otpVerifiedAt: {
      type: Date,
    },

    accessEndsAt: {
      type: Date,
    },

    isOpened: {
      type: Boolean,
      default: false,
    },

    // ACCESS CONTROL FLAGS

    downloadAllowed: {
      type: Boolean,
      default: true,
    },

    offlineAllowed: {
      type: Boolean,
      default: true,
    },

    maxDownloads: {
      type: Number,
      default: null,
    },

    // AUDIT & STATE

    lastAccessedAt: {
      type: Date,
    },

    accessCount: {
      type: Number,
      default: 0,
    },

    // OTP Rate Limiting
    otpAttempts: {
      type: Number,
      default: 0,
    },

    lastOtpAttemptAt: {
      type: Date,
    },

    // File Security and Moderation
    isDisabled: {
      type: Boolean,
      default: false,
    },

    disabledReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for cleanup jobs
fileSchema.index({ linkExpiresAt: 1 });
fileSchema.index({ accessEndsAt: 1 });
fileSchema.index({ owner: 1, createdAt: -1 });

export const File = mongoose.model("File", fileSchema);
