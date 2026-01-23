import { File } from "../models/file.model.js";

export const listAllFiles = async ({
  page = 1,
  limit = 20,
  type,
  status,
  owner,
  sort = "latest",
}) => {
  const now = new Date();
  const query = {};

  if (owner) query.owner = owner;
  if (type) query.fileType = type;

  if (status === "active") {
    query.isDisabled = false;
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

  const sortOptions =
    sort === "expiry" ? { linkExpiresAt: 1 } : { createdAt: -1 };

  const skip = (page - 1) * limit;

  const [files, total] = await Promise.all([
    File.find(query)
      .populate("owner", "email fullName")
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
