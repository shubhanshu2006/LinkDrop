import cron from "node-cron";
import fs from "fs";
import path from "path";
import { File } from "../models/file.model.js";

const FILES_DIR = path.join(process.cwd(), "src/uploads/files");

export const startFileCleanupJob = () => {
  // Runs every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    console.log(" File cleanup job started");

    const now = new Date();

    try {
      // Find expired files
      const expiredFiles = await File.find({
        $or: [
          { linkExpiresAt: { $lte: now } },
          { accessEndsAt: { $lte: now } },
        ],
      });

      for (const file of expiredFiles) {
        const filePath = path.join(FILES_DIR, file.storageName);

        // Remove file from disk
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        // Remove DB record
        await file.deleteOne();
      }

      console.log(` Cleaned ${expiredFiles.length} expired files`);
    } catch (err) {
      console.error(" File cleanup job failed:", err);
    }
  });
};
