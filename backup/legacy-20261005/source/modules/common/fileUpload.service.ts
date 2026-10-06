import { injectable, inject } from "inversify";
import { EntityManager } from "typeorm";
import { FileUploadRepository } from "./fileUpload.repository";
import { COMMON_TYPES } from "./common.types";
import { minioUtils } from "@/shared/utils/minio.utils";
import { ApiResponse } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { FileUpload } from "@/database/models/FileUpload";

export interface GetPresignedUrlDto {
  filename: string;
  folder?: string;
  bucketName?: string;
}

export interface ConfirmUploadDto {
  objectName: string;
  originalName: string;
  bucketName: string;
  mimeType?: string;
  size: number;
  folder?: string;
  etag?: string;
  metadata?: Record<string, any>;
}

export interface ListFilesQuery {
  page?: number;
  limit?: number;
  folder?: string;
  userId?: string;
}

@injectable()
export class FileUploadService {
  private readonly defaultBucket = "uploads";

  constructor(
    @inject(COMMON_TYPES.FileUploadRepository)
    private fileUploadRepository: FileUploadRepository,
  ) {}

  /**
   * Lấy presigned URL để upload file
   */
  async getPresignedUploadUrl(
    dto: GetPresignedUrlDto,
    userId?: string,
    manager?: EntityManager,
  ): Promise<ApiResponse<{ uploadUrl: string; objectName: string; bucketName: string }>> {
    try {
      const bucketName = dto.bucketName || this.defaultBucket;
      const folder = dto.folder || "general";
      const timestamp = Date.now();
      const objectName = `${folder}/${timestamp}-${dto.filename}`;

      // Đảm bảo bucket tồn tại
      await minioUtils.createBucket(bucketName);

      // Tạo presigned URL (15 phút)
      const uploadUrl = await minioUtils.getPresignedUploadUrl(bucketName, objectName, 15 * 60);

      return ApiResponseHandler.getSuccess("Presigned URL created successfully", {
        uploadUrl,
        objectName,
        bucketName,
      });
    } catch (error) {
      console.error("Error getting presigned upload URL:", error);
      return ApiResponseHandler.error(500, "Failed to create presigned URL", error);
    }
  }

  /**
   * Xác nhận upload thành công và lưu thông tin vào database
   */
  async confirmUpload(
    dto: ConfirmUploadDto,
    userId?: string,
    manager?: EntityManager,
  ): Promise<ApiResponse<FileUpload>> {
    try {
      // Kiểm tra file có tồn tại trên MinIO không
      const fileExists = await minioUtils.fileExists(dto.bucketName, dto.objectName);
      if (!fileExists) {
        return ApiResponseHandler.error(404, "File not found on storage");
      }

      // Lấy metadata từ MinIO
      const metadata = await minioUtils.getObjectMetadata(dto.bucketName, dto.objectName);

      // Tạo presigned download URL (7 ngày)
      const downloadUrl = await minioUtils.getPresignedDownloadUrl(dto.bucketName, dto.objectName, 7 * 24 * 60 * 60);

      // Tự động tạo thumbnail nếu là file ảnh
      let thumbnailObjectName: string | undefined;
      let thumbnailUrl: string | undefined;
      let thumbnailSize: number | undefined;

      const mimeType = dto.mimeType || metadata.metaData?.["content-type"];
      if (minioUtils.isSupportedImageFormat(mimeType)) {
        console.log(`Creating thumbnail for image: ${dto.objectName}`);
        const thumbnailResult = await minioUtils.createAndUploadThumbnail(dto.bucketName, dto.objectName, mimeType, {
          width: 300,
          height: 300,
          quality: 80,
        });

        if (thumbnailResult) {
          thumbnailObjectName = thumbnailResult.thumbnailObjectName;
          thumbnailSize = thumbnailResult.thumbnailSize;
          // Tạo presigned URL cho thumbnail (7 ngày)
          thumbnailUrl = await minioUtils.getPresignedDownloadUrl(
            dto.bucketName,
            thumbnailResult.thumbnailObjectName,
            7 * 24 * 60 * 60,
          );
          console.log(`Thumbnail created successfully: ${thumbnailObjectName}`);
        }
      }

      // Lưu thông tin vào database
      const fileUpload = this.fileUploadRepository.create({
        objectName: dto.objectName,
        originalName: dto.originalName,
        bucketName: dto.bucketName,
        mimeType,
        size: dto.size || metadata.size,
        folder: dto.folder,
        etag: dto.etag || metadata.etag,
        downloadUrl,
        thumbnailObjectName,
        thumbnailUrl,
        thumbnailSize,
        uploadedBy: userId,
        metadata: dto.metadata,
        isActive: true,
      });

      const savedFile = await this.fileUploadRepository.save(fileUpload);

      return ApiResponseHandler.getSuccess("File uploaded successfully", savedFile);
    } catch (error) {
      console.error("Error confirming upload:", error);
      return ApiResponseHandler.error(500, "Failed to confirm upload", error);
    }
  }

  /**
   * Lấy danh sách file
   */
  async listFiles(
    query: ListFilesQuery,
    manager?: EntityManager,
  ): Promise<ApiResponse<{ files: FileUpload[]; total: number; page: number; limit: number }>> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 50;

      let files: FileUpload[];
      let total: number;

      if (query.folder) {
        files = await this.fileUploadRepository.findByFolder(query.folder, limit);
        total = files.length;
      } else if (query.userId) {
        files = await this.fileUploadRepository.findByUser(query.userId, limit);
        total = files.length;
      } else {
        const result = await this.fileUploadRepository.findAllActive(page, limit);
        files = result.files;
        total = result.total;
      }

      return ApiResponseHandler.getSuccess("Files retrieved successfully", {
        files,
        total,
        page,
        limit,
      });
    } catch (error) {
      console.error("Error listing files:", error);
      return ApiResponseHandler.error(500, "Failed to list files", error);
    }
  }

  /**
   * Lấy thông tin chi tiết file
   */
  async getFileDetail(fileId: string, manager?: EntityManager): Promise<ApiResponse<FileUpload>> {
    try {
      const file = await this.fileUploadRepository.findOne({
        where: { id: fileId, isActive: true },
        relations: ["uploader"],
      });

      if (!file) {
        return ApiResponseHandler.error(404, "File not found");
      }

      // Tạo download URL mới (7 ngày)
      const downloadUrl = await minioUtils.getPresignedDownloadUrl(file.bucketName, file.objectName, 7 * 24 * 60 * 60);

      file.downloadUrl = downloadUrl;

      // Tạo thumbnail URL mới nếu có thumbnail
      if (file.thumbnailObjectName) {
        file.thumbnailUrl = await minioUtils.getPresignedDownloadUrl(
          file.bucketName,
          file.thumbnailObjectName,
          7 * 24 * 60 * 60,
        );
      }

      return ApiResponseHandler.getSuccess("File detail retrieved successfully", file);
    } catch (error) {
      console.error("Error getting file detail:", error);
      return ApiResponseHandler.error(500, "Failed to get file detail", error);
    }
  }

  /**
   * Xóa file (soft delete)
   */
  async deleteFile(fileId: string, userId?: string, manager?: EntityManager): Promise<ApiResponse<void>> {
    try {
      const file = await this.fileUploadRepository.findOne({
        where: { id: fileId, isActive: true },
      });

      if (!file) {
        return ApiResponseHandler.error(404, "File not found");
      }

      // Kiểm tra quyền (optional - có thể bỏ comment nếu cần)
      // if (file.uploadedBy !== userId) {
      //   return ApiResponseHandler.error(403, "You don't have permission to delete this file");
      // }

      // Soft delete trong database
      await this.fileUploadRepository.softDeleteFile(fileId);

      // Optional: Xóa file thật trên MinIO (comment lại nếu chỉ muốn soft delete)
      // await minioUtils.deleteFile(file.bucketName, file.objectName);
      // if (file.thumbnailObjectName) {
      //   await minioUtils.deleteFile(file.bucketName, file.thumbnailObjectName);
      // }

      return ApiResponseHandler.getSuccess("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      return ApiResponseHandler.error(500, "Failed to delete file", error);
    }
  }

  /**
   * Lấy presigned download URL cho file đã tồn tại
   */
  async getDownloadUrl(
    fileId: string,
    expirySeconds?: number,
    manager?: EntityManager,
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      const file = await this.fileUploadRepository.findOne({
        where: { id: fileId, isActive: true },
      });

      if (!file) {
        return ApiResponseHandler.error(404, "File not found");
      }

      const expiry = expirySeconds || 7 * 24 * 60 * 60; // 7 ngày mặc định
      const downloadUrl = await minioUtils.getPresignedDownloadUrl(file.bucketName, file.objectName, expiry);

      return ApiResponseHandler.getSuccess("Download URL created successfully", {
        downloadUrl,
      });
    } catch (error) {
      console.error("Error getting download URL:", error);
      return ApiResponseHandler.error(500, "Failed to get download URL", error);
    }
  }
}
