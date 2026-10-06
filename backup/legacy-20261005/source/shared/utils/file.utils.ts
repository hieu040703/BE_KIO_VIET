import fs from "fs";
import path from "path";
import logger from "./logger";
import { config } from "@/shared/config/env";
import { ValidationError } from "../types/errors";

/**
 * @description Move a file from one location to another.
 * @param {string[]} source - The path to the source file.
 */
export const moveFile = (source: string[], movePath: string) => {
  const newPaths: string[] = [];

  source.forEach((url, index) => {
    const sourcePath = url;
    const destinationPath = path.join(config.UPLOAD_DIR, movePath, path.basename(url));

    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
      logger.info(`Created directory: ${path.dirname(destinationPath)}`);
    }

    logger.info(`Moving file from ${sourcePath} to ${destinationPath}`);

    if (!fs.existsSync(sourcePath)) {
      logger.error(`Source file does not exist: ${sourcePath}`);
      throw new ValidationError("file.not_found");
    }

    if (fs.existsSync(destinationPath)) {
      logger.error(`Destination file already exists: ${destinationPath}`);
      throw new ValidationError("file.already_exists");
    }

    fs.renameSync(sourcePath, destinationPath);
    logger.info(`File moved from ${sourcePath} to ${destinationPath}`);

    newPaths.push(destinationPath);
  });

  return newPaths;
};

/**
 * @description Merge file lists: add new files, delete old ones, and return the updated list.
 * @param current - Current list of file paths.
 * @param files_add - Files to add (source paths).
 * @param files_delete - Files to delete (full paths).
 * @param movePath - Destination subdirectory inside UPLOAD_DIR.
 */
export const mergeFiles = (
  current: string[],
  files_add: string[],
  files_delete: string[],
  movePath: string
): string[] => {
  // 1. Move new files
  const movedFiles = files_add.length > 0 ? moveFile(files_add, movePath) : [];

  // 2. Delete files
  for (const filePath of files_delete) {
    const absPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(config.UPLOAD_DIR, movePath, path.basename(filePath));

    if (fs.existsSync(absPath)) {
      try {
        fs.unlinkSync(absPath);
        logger.info(`Deleted file: ${absPath}`);
      } catch (err) {
        logger.error(`Error deleting file ${absPath}: ${err}`);
      }
    } else {
      logger.warn(`File to delete not found: ${absPath}`);
    }
  }

  // 3. Build new files array
  const deletedBasenames = new Set(files_delete.map((f) => path.basename(f)));
  const remainingFiles = current.filter((file) => !deletedBasenames.has(path.basename(file)));

  const newFiles = [...remainingFiles, ...movedFiles];

  return newFiles;
};

/**
 * @description Move files to the backup folder (uploads/backup).
 * @param {string[]} files - Array of file paths (absolute or relative).
 */
export const deleteFiles = (files: string[]): string[] => {
  if (!files || files.length === 0) return [];

  const backupDir = path.join(config.UPLOAD_DIR, "backup");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    logger.info(`Created backup directory: ${backupDir}`);
  }

  const movedPaths: string[] = [];

  for (const filePath of files) {
    const absSourcePath = path.isAbsolute(filePath) ? filePath : path.join(config.UPLOAD_DIR, path.basename(filePath));

    if (!fs.existsSync(absSourcePath)) {
      logger.warn(`File not found, skipping: ${absSourcePath}`);
      continue;
    }

    const destinationPath = path.join(backupDir, path.basename(absSourcePath));

    if (fs.existsSync(destinationPath)) {
      logger.warn(`Backup file already exists, overwriting: ${destinationPath}`);
      try {
        fs.unlinkSync(destinationPath);
      } catch (err) {
        logger.error(`Failed to remove existing backup file: ${destinationPath}, error: ${err}`);
        continue;
      }
    }

    try {
      fs.renameSync(absSourcePath, destinationPath);
      movedPaths.push(destinationPath);
      logger.info(`Moved file to backup: ${destinationPath}`);
    } catch (err) {
      logger.error(`Error moving file to backup: ${absSourcePath} -> ${destinationPath}, error: ${err}`);
    }
  }

  return movedPaths;
};

export const compressFilesToZip = async (filePaths: string[], zipFilePath: string): Promise<string> => {
  const archiver = await import("archiver");
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver.default("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on("close", () => {
      logger.info(`Created zip file: ${zipFilePath} (${archive.pointer()} total bytes)`);
      resolve(zipFilePath);
    });

    archive.on("error", (err) => {
      logger.error(`Error creating zip file: ${err}`);
      reject(err);
    });

    archive.pipe(output);

    filePaths.forEach((filePath) => {
      const fileName = path.basename(filePath);
      archive.file(filePath, { name: fileName });
    });

    archive.finalize();
  });
};

/**
 * create a directory if it does not exist
 * @param dirPath
 */
export const createDirectoryIfNotExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.info(`Created directory: ${dirPath}`);
  }
};
