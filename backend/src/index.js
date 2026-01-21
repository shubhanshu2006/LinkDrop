import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { startFileCleanupJob } from "./jobs/fileCleanup.job.js";

dotenv.config();

const PORT = process.env.PORT || 8001;

connectDB()
  .then(() => {
    startFileCleanupJob();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  });
