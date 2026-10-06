import { Router } from "express";
import { injectable, inject } from "inversify";
import { FileController } from "./file.controller";
import { authenticate } from "@/shared/middleware/auth.middleware";
import { FileParamsSchema, UploadSchema } from "./file.validator";
import multer from "multer";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { FILE_TYPES } from "./file.types";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { FilenameUtils } from "@/shared/utils/filename.utils";

// Multer upload config (temp storage with extension preserved)
let folderPath = "uploads/temp";

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    // Fix encoding issue: Multer receives filename in Latin1, convert to UTF-8
    const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");
    const uniqueFilename = FilenameUtils.generateUniqueFilename(originalName);
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

/**
 * File Routes - 3 endpoints tinh gọn
 * POST /       - Upload multiple files
 * DELETE /:id  - Delete file
 * POST /:id/set-main - Set main file
 */
@injectable()
export class FileRouter {
  public router: Router;

  constructor(@inject(FILE_TYPES.FileController) private fileController: FileController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All routes require authentication
    // this.router.use(authenticate);

    // Upload multiple files
    this.router.post(
      "/",
      upload.array("files", 10), // Max 10 files
      zodValidate(UploadSchema, "body"),
      this.fileController.uploadMultiple,
    );

    // Set main file
    this.router.post("/:id/set-main", zodValidate(FileParamsSchema, "params"), this.fileController.setMainFile);

    // Preview ảnh bằng JPEG, dùng cho HEIC/HEIF và các ảnh không có thumbnail hợp lệ
    this.router.get("/:id/preview", zodValidate(FileParamsSchema, "params"), this.fileController.getPreview);

    // Delete file
    this.router.delete("/:id", zodValidate(FileParamsSchema, "params"), this.fileController.deleteOne);
  }

  public getRouter(): Router {
    return this.router;
  }
}
