import { File } from "../models/file.model.js";

export const listUserFiles = async ({
  userId,
  page = 1,
  limit = 10,
  type,
  status,
  sort = "latest",
}) => {
  const now = new Date();

  const query = { owner: userId };

  // Filter by file type
  if (type) {
    query.fileType = type;
  }

  // Status filters
  if (status === "active") {
    query.isDisabled = false;
    query.scanStatus = "clean";
    query.linkExpiresAt = { $gt: now };
  }

  if (status === "expired") {
    query.$or = [
      { linkExpiresAt: { $lte: now } },
      { accessEndsAt: { $lte: now } },
    ];
  }

  if (status === "disabled") {
    query.isDisabled = true;
  }

  if (status === "infected") {
    query.scanStatus = "infected";
  }

  // Sorting
  const sortOptions =
    sort === "expiry" ? { linkExpiresAt: 1 } : { createdAt: -1 };

  const skip = (page - 1) * limit;

  const [files, total] = await Promise.all([
    File.find(query)
      .select(
        "-storageName -otpHash -otpExpiresAt -otpAttempts -lastOtpAttemptAt"
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),

    File.countDocuments(query),
  ]);

  return {
    files,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
