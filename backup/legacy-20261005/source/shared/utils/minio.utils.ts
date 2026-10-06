import { minioClient } from "../config/minio";
import logger from "./logger";
import { Readable } from "stream";
import * as path from "path";
import { Client } from "minio";
import { thumbnailUtils } from "./thumbnail.utils";

/**
 * MinIO Utilities Class
 * Các phương thức hỗ trợ làm việc với MinIO Object Storage
 */
export class MinioUtils {
  private client: Client;

  constructor(client?: Client) {
    this.client = client || minioClient;
  }

  /**
   * Kiểm tra bucket có tồn tại không
   */
  async bucketExists(bucketName: string): Promise<boolean> {
    try {
      const exists = await this.client.bucketExists(bucketName);
      return exists;
    } catch (error) {
      logger.error(`Error checking bucket ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Tạo bucket mới
   */
  async createBucket(bucketName: string, region?: string): Promise<void> {
    try {
      const exists = await this.bucketExists(bucketName);
      if (!exists) {
        await this.client.makeBucket(bucketName, region || "");
        logger.info(`Bucket ${bucketName} created successfully`);
      } else {
        logger.info(`Bucket ${bucketName} already exists`);
      }
    } catch (error) {
      logger.error(`Error creating bucket ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Upload file từ buffer hoặc stream
   */
  async uploadFile(
    bucketName: string,
    objectName: string,
    fileBuffer: Buffer | Readable,
    metadata?: Record<string, string>,
  ): Promise<{ etag: string; versionId: string | null }> {
    try {
      // Đảm bảo bucket tồn tại
      await this.createBucket(bucketName);

      const result = await this.client.putObject(bucketName, objectName, fileBuffer);
      logger.info(`File uploaded: ${objectName} to bucket ${bucketName}`);
      return result;
    } catch (error) {
      logger.error(`Error uploading file ${objectName}:`, error);
      throw error;
    }
  }

  /**
   * Upload file từ đường dẫn file
   */
  async uploadFileFromPath(
    bucketName: string,
    objectName: string,
    filePath: string,
    metadata?: Record<string, string>,
  ): Promise<{ etag: string; versionId: string | null }> {
    try {
      await this.createBucket(bucketName);
      const result = await this.client.fPutObject(bucketName, objectName, filePath, metadata || {});
      logger.info(`File uploaded from path: ${filePath} to ${objectName}`);
      return result;
    } catch (error) {
      logger.error(`Error uploading file from path ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Download file dưới dạng buffer
   */
  async downloadFile(bucketName: string, objectName: string): Promise<Buffer> {
    try {
      const stream = await this.client.getObject(bucketName, objectName);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
      });
    } catch (error) {
      logger.error(`Error downloading file ${objectName}:`, error);
      throw error;
    }
  }

  /**
   * Download file về đường dẫn
   */
  async downloadFileToPath(bucketName: string, objectName: string, filePath: string): Promise<void> {
    try {
      await this.client.fGetObject(bucketName, objectName, filePath);
      logger.info(`File downloaded: ${objectName} to ${filePath}`);
    } catch (error) {
      logger.error(`Error downloading file ${objectName} to path:`, error);
      throw error;
    }
  }

  /**
   * Xóa file
   */
  async deleteFile(bucketName: string, objectName: string): Promise<void> {
    try {
      await this.client.removeObject(bucketName, objectName);
      logger.info(`File deleted: ${objectName} from bucket ${bucketName}`);
    } catch (error) {
      logger.error(`Error deleting file ${objectName}:`, error);
      throw error;
    }
  }

  /**
   * Xóa nhiều file
   */
  async deleteFiles(bucketName: string, objectNames: string[]): Promise<void> {
    try {
      await this.client.removeObjects(bucketName, objectNames);
      logger.info(`${objectNames.length} files deleted from bucket ${bucketName}`);
    } catch (error) {
      logger.error(`Error deleting multiple files:`, error);
      throw error;
    }
  }

  /**
   * Lấy presigned URL để download (có thời hạn)
   */
  async getPresignedDownloadUrl(
    bucketName: string,
    objectName: string,
    expiry: number = 7 * 24 * 60 * 60, // 7 ngày mặc định
  ): Promise<string> {
    try {
      const url = await this.client.presignedGetObject(bucketName, objectName, expiry);
      return url;
    } catch (error) {
      logger.error(`Error generating presigned download URL for ${objectName}:`, error);
      throw error;
    }
  }

  /**
   * Lấy presigned URL để upload (có thời hạn)
   */
  async getPresignedUploadUrl(
    bucketName: string,
    objectName: string,
    expiry: number = 15 * 60, // 15 phút mặc định
  ): Promise<string> {
    try {
      const url = await this.client.presignedPutObject(bucketName, objectName, expiry);
      return url;
    } catch (error) {
      logger.error(`Error generating presigned upload URL for ${objectName}:`, error);
      throw error;
    }
  }

  /**
   * Liệt kê tất cả objects trong bucket
   */
  async listObjects(bucketName: string, prefix?: string, recursive: boolean = true): Promise<any[]> {
    try {
      const objectsList: any[] = [];
      const stream = this.client.listObjects(bucketName, prefix, recursive);

      return new Promise((resolve, reject) => {
        stream.on("data", (obj) => objectsList.push(obj));
        stream.on("end", () => resolve(objectsList));
        stream.on("error", reject);
      });
    } catch (error) {
      logger.error(`Error listing objects in bucket ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Lấy metadata của object
   */
  async getObjectMetadata(bucketName: string, objectName: string): Promise<any> {
    try {
      const stat = await this.client.statObject(bucketName, objectName);
      return stat;
    } catch (error) {
      logger.error(`Error getting metadata for ${objectName}:`, error);
      throw error;
    }
  }

  /**
   * Copy object từ bucket này sang bucket khác
   */
  async copyObject(sourceBucket: string, sourceObject: string, destBucket: string, destObject: string): Promise<any> {
    try {
      await this.createBucket(destBucket);
      const result = await this.client.copyObject(destBucket, destObject, `/${sourceBucket}/${sourceObject}`);
      logger.info(`Object copied from ${sourceBucket}/${sourceObject} to ${destBucket}/${destObject}`);
      return result;
    } catch (error) {
      logger.error(`Error copying object:`, error);
      throw error;
    }
  }

  /**
   * Xóa bucket (phải trống)
   */
  async deleteBucket(bucketName: string): Promise<void> {
    try {
      await this.client.removeBucket(bucketName);
      logger.info(`Bucket ${bucketName} deleted successfully`);
    } catch (error) {
      logger.error(`Error deleting bucket ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Set bucket policy (public, private, etc.)
   */
  async setBucketPolicy(bucketName: string, policy: string): Promise<void> {
    try {
      await this.client.setBucketPolicy(bucketName, policy);
      logger.info(`Policy set for bucket ${bucketName}`);
    } catch (error) {
      logger.error(`Error setting bucket policy for ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Get bucket policy
   */
  async getBucketPolicy(bucketName: string): Promise<string> {
    try {
      const policy = await this.client.getBucketPolicy(bucketName);
      return policy;
    } catch (error) {
      logger.error(`Error getting bucket policy for ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Tạo public read policy cho bucket
   */
  makePublicReadPolicy(bucketName: string): string {
    return JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    });
  }

  /**
   * Kiểm tra file có tồn tại không
   */
  async fileExists(bucketName: string, objectName: string): Promise<boolean> {
    try {
      await this.client.statObject(bucketName, objectName);
      return true;
    } catch (error: any) {
      if (error.code === "NotFound") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Lấy file size
   */
  async getFileSize(bucketName: string, objectName: string): Promise<number> {
    try {
      const stat = await this.client.statObject(bucketName, objectName);
      return stat.size;
    } catch (error) {
      logger.error(`Error getting file size for ${objectName}:`, error);
      throw error;
    }
  }

  /**
   * Upload file với tên tự động (sử dụng timestamp)
   */
  async uploadFileWithTimestamp(
    bucketName: string,
    file: Buffer | Readable,
    originalFilename: string,
    metadata?: Record<string, string>,
  ): Promise<{ objectName: string; etag: string; versionId: string | null }> {
    try {
      const ext = path.extname(originalFilename);
      const timestamp = Date.now();
      const objectName = `${timestamp}${ext}`;

      const result = await this.uploadFile(bucketName, objectName, file, metadata);
      return { objectName, ...result };
    } catch (error) {
      logger.error(`Error uploading file with timestamp:`, error);
      throw error;
    }
  }

  /**
   * Upload file vào thư mục cụ thể
   */
  async uploadFileToFolder(
    bucketName: string,
    folder: string,
    filename: string,
    file: Buffer | Readable,
    metadata?: Record<string, string>,
  ): Promise<{ objectName: string; etag: string; versionId: string | null }> {
    try {
      const objectName = `${folder}/${filename}`;
      const result = await this.uploadFile(bucketName, objectName, file, metadata);
      return { objectName, ...result };
    } catch (error) {
      logger.error(`Error uploading file to folder:`, error);
      throw error;
    }
  }

  /**
   * Tạo và upload thumbnail cho ảnh
   * Trả về thông tin thumbnail đã upload
   */
  async createAndUploadThumbnail(
    bucketName: string,
    originalObjectName: string,
    mimeType?: string,
    thumbnailConfig?: {
      width?: number;
      height?: number;
      quality?: number;
      suffix?: string;
    },
  ): Promise<{
    thumbnailObjectName: string;
    thumbnailSize: number;
    etag: string;
    versionId: string | null;
  } | null> {
    try {
      // Kiểm tra xem có phải file ảnh không
      if (!thumbnailUtils.isSupportedImageFormat(mimeType)) {
        logger.info(`File ${originalObjectName} is not a supported image format, skipping thumbnail`);
        return null;
      }

      // Download ảnh gốc từ MinIO
      logger.info(`Downloading image ${originalObjectName} to create thumbnail`);
      const imageBuffer = await this.downloadFile(bucketName, originalObjectName);

      // Tạo thumbnail
      logger.info(`Creating thumbnail for ${originalObjectName}`);
      const thumbnail = await thumbnailUtils.createThumbnail(imageBuffer, {
        width: thumbnailConfig?.width || 300,
        height: thumbnailConfig?.height || 300,
        quality: thumbnailConfig?.quality || 80,
      });

      // Tạo tên cho thumbnail
      const suffix = thumbnailConfig?.suffix || "thumb";
      const thumbnailObjectName = thumbnailUtils.generateThumbnailName(originalObjectName, suffix);

      // Upload thumbnail lên MinIO
      logger.info(`Uploading thumbnail ${thumbnailObjectName}`);
      const uploadResult = await this.uploadFile(bucketName, thumbnailObjectName, thumbnail.buffer, {
        "Content-Type": `image/${thumbnail.format}`,
        "x-amz-meta-original": originalObjectName,
        "x-amz-meta-thumbnail": "true",
      });

      logger.info(`Thumbnail created successfully: ${thumbnailObjectName} (${thumbnail.size} bytes)`);

      return {
        thumbnailObjectName,
        thumbnailSize: thumbnail.size,
        etag: uploadResult.etag,
        versionId: uploadResult.versionId,
      };
    } catch (error) {
      logger.error(`Error creating and uploading thumbnail for ${originalObjectName}:`, error);
      // Không throw error, chỉ return null để không làm fail toàn bộ flow
      return null;
    }
  }

  /**
   * Kiểm tra file có phải ảnh không
   */
  isImageFile(mimeType?: string): boolean {
    return thumbnailUtils.isImageFile(mimeType);
  }

  /**
   * Kiểm tra file có support tạo thumbnail không
   */
  isSupportedImageFormat(mimeType?: string): boolean {
    return thumbnailUtils.isSupportedImageFormat(mimeType);
  }
}

// Export singleton instance
export const minioUtils = new MinioUtils();

// Export default
export default minioUtils;
