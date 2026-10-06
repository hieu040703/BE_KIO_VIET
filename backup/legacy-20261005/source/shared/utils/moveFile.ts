import fs from "fs";
import path from "path";
import logger from "./logger";
import { getConfig } from "@/shared/config/env";
import { config } from "@/shared/config/env";
import { NotFoundError } from "../types/errors";

/**
 * @description Move a file from one location to another.
 * @param {string[]} source - The path to the source file.
 */
export const moveFile = (source: string[], movePath: string) => {
  for (const url of source) {
    const sourcePath = url;
    const destinationPath = path.join(config.UPLOAD_DIR, movePath, path.basename(url));

    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
      logger.info(`Created directory: ${path.dirname(destinationPath)}`);
    }

    logger.info(`Moving file from ${sourcePath} to ${destinationPath}`);

    if (!fs.existsSync(sourcePath)) {
      logger.error(`Source file does not exist: ${sourcePath}`);
      throw new NotFoundError(`Source file does not exist: ${sourcePath}`);
    }
    if (fs.existsSync(destinationPath)) {
      logger.error(`Destination file already exists: ${destinationPath}`);
      throw new NotFoundError(`Destination file already exists: ${destinationPath}`);
    }
    fs.rename(sourcePath, destinationPath, (err) => {
      if (err) {
        logger.error(`Error moving file from ${sourcePath} to ${destinationPath}: ${err}`);
        throw err;
      }
      logger.info(`File moved from ${sourcePath} to ${destinationPath}`);
    });
  }

  // return the new path
  const newPaths = source.map((url) => {
    return path.join(config.UPLOAD_DIR, movePath, path.basename(url));
  });
  return newPaths;
};
