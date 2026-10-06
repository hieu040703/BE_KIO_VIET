import { RequestWithUser } from "@/shared/types/interfaces";
import { NextFunction, Response } from "express";
import { inject, injectable } from "inversify";
import { COMMON_TYPES } from "./common.types";
import { FileUploadService, GetPresignedUrlDto, ConfirmUploadDto } from "./fileUpload.service";
import { Request } from "express";

@injectable()
export class FileUploadController {
  constructor(
    @inject(COMMON_TYPES.FileUploadService)
    private fileUploadService: FileUploadService,
  ) {}

  /**
   * GET /api/common/files/presigned-upload-url
   * Lấy presigned URL để upload file
   */
  getPresignedUploadUrl = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const dto: GetPresignedUrlDto = {
        filename: req.query.filename as string,
        folder: req.query.folder as string,
        bucketName: req.query.bucketName as string,
      };

      if (!dto.filename) {
        return res.status(400).json({ error: "Filename is required" });
      }

      const userId = req.user?.userId as string;
      const result = await this.fileUploadService.getPresignedUploadUrl(dto, userId);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/common/files/confirm-upload
   * Xác nhận file đã upload thành công
   */
  confirmUpload = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const dto: ConfirmUploadDto = req.body;

      if (!dto.objectName || !dto.originalName || !dto.bucketName || !dto.size) {
        return res.status(400).json({
          error: "objectName, originalName, bucketName, and size are required",
        });
      }

      const userId = req.user?.userId as string;
      const result = await this.fileUploadService.confirmUpload(dto, userId);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/common/files
   * Lấy danh sách file
   */
  listFiles = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        folder: req.query.folder as string,
        userId: req.query.userId as string | undefined,
      };

      const result = await this.fileUploadService.listFiles(query);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/common/files/:id
   * Lấy thông tin chi tiết file
   */
  getFileDetail = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const fileId = req.params.id as string;

      if (fileId) {
        return res.status(400).json({ error: "Invalid file ID" });
      }

      const result = await this.fileUploadService.getFileDetail(fileId);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/common/files/:id
   * Xóa file
   */
  deleteFile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const fileId = req.params.id as string;

      if (fileId) {
        return res.status(400).json({ error: "Invalid file ID" });
      }

      const userId = req.user?.userId as string;
      const result = await this.fileUploadService.deleteFile(fileId, userId);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/common/files/:id/download-url
   * Lấy presigned download URL
   */
  getDownloadUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("req.params", req.params.id as string);
      const fileId = req.params.id as string;
      const expirySeconds = req.query.expiry ? parseInt(req.query.expiry as string) : undefined;

      if (!fileId) {
        return res.status(400).json({ error: "Invalid file ID" });
      }

      const result = await this.fileUploadService.getDownloadUrl(fileId, expirySeconds);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };
}
