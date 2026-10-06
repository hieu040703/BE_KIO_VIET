import { inject, injectable } from "inversify";
import { Request, Response, NextFunction } from "express";
import { BaseController } from "@/shared/base/BaseController";
import { FileService } from "./file.service";
import { FILE_TYPES } from "./file.types";
import { asyncHandler, sendError, sendResponse } from "@/shared/utils/controller.utils";
import logger from "@/shared/utils/logger";
import { UploadDto } from "./file.validator";

/**
 * File Controller - Tenant scoped
 * 3 endpoints: upload multiple, delete, set main
 */
@injectable()
export class FileController extends BaseController<FileService> {
  constructor(@inject(FILE_TYPES.FileService) private fileService: FileService) {
    super(fileService);
  }

  /**
   * POST /
   * Upload multiple files
   * Body (form-data): entityId?, entityType?, category?
   * Files: files[] field
   */
  uploadMultiple = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      const body: UploadDto = req.body;

      if (!files || files.length === 0) {
        throw new Error("No files uploaded");
      }

      // Kiểm tra sớm nếu tất cả files đều rỗng (size = 0)
      const nonEmptyFiles = files.filter((f) => f.size > 0);
      if (nonEmptyFiles.length === 0) {
        return sendError(res, "All uploaded files are empty (size = 0). Please re-select the file and try again.", 400);
      }

      const uploaded = await this.fileService.uploadMultiple(files, body);

      sendResponse(res, { files: uploaded, count: uploaded.length }, "Files uploaded successfully", 201);
    } catch (error) {
      console.log(error);
      sendError(res);
    }
  });

  /**
   * DELETE /:id
   * Delete file (DB + physical file)
   */
  deleteOne = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      await this.fileService.deleteFile(id);

      sendResponse(res, "File deleted successfully");
    } catch (error) {
      logger.error("Error FileController:[deleteOne]:", error);
      sendError(res, "Delete failed", 400);
    }
  });

  /**
   * POST /:id/set-main
   * Set file as main file
   */
  setMainFile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const success = await this.fileService.setMainFile(id);

      sendResponse(res, { data: { success } });
    } catch (error) {
      logger.error("Error FileController:[setMainFile]:", error);
      sendError(res, "Failed to set main file", 400);
    }
  });

  /**
   * GET /:id/preview
   * Trả về bản JPEG để trình duyệt preview các ảnh như HEIC/HEIF.
   */
  getPreview = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.fileService.getPreview(req.params.id as string);

    res
      .status(200)
      .setHeader("Content-Type", result.contentType)
      .setHeader("Content-Disposition", "inline")
      .send(result.buffer);
  });
}
