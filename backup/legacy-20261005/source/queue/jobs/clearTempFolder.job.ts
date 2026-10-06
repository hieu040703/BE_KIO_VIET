import logger from "@/shared/utils/logger";
import { Cron } from "croner";

function clearTempFolder() {
  // Clear all files in the 'temp' folder
  const fs = require("fs");
  const path = require("path");
  const tempDir = "uploads/temp";

  fs.readdir(tempDir, (err: NodeJS.ErrnoException | null, files: string[]) => {
    if (err) {
      logger.error("Error reading temp directory:", err);
      return;
    }

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
        if (err) {
          logger.error(`Error deleting file ${filePath}:`, err);
        } else {
          logger.info(`Deleted file: ${filePath}`);
        }
      });
    }
  });
}

let job: Cron | null = null;
export const JobClearTempFolder = {
  start: () => {
    if (!job) {
      job = new Cron(
        "0 */10 * * * *", // chạy mỗi 10 phút
        { timezone: "Asia/Ho_Chi_Minh" },
        async () => {
          logger.info("START JOB REINVESTMENT: " + new Date().toISOString());
          await clearTempFolder();
        }
      );
    }
  },
  stop: () => {
    if (job) {
      job.stop();
      job = null;
      logger.info("Event sent notification job stopped!");
    }
  },
};
