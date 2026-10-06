import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { File } from "@/database/models/File";
import { FileRepository } from "./file.repository";
import { FILE_TYPES } from "./file.types";
import logger from "@/shared/utils/logger";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import sharp from "sharp";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { ErrorsMessages } from "@/shared/constants/errors";
import { EntityTypeEnum, FileCategoryEnum, FileStatusEnum, FileTypeEnum } from "@/shared/constants/constance";
import { thumbnailUtils } from "@/shared/utils/thumbnail.utils";

const execFileAsync = promisify(execFile);

/**
 * File Service -  scoped
 * 3 methods chính: uploadMultiple, deleteFile, setMainFile
 * + cleanupPendingFiles cho background job
 */
@injectable()
export class FileService extends BaseService<File> {
  protected repository: FileRepository;
  protected searchableFields: (keyof File)[] = [
    "fileName",
    "originalName",
    "path",
    "url",
    "type",
    "thumbnailUrl",
    "thumbnailPath",
    "entityType",
    "category",
    "alt",
    "note",
  ];

  constructor(@inject(FILE_TYPES.FileRepository) private fileRepository: FileRepository) {
    super(fileRepository);
    this.repository = fileRepository;
  }

  /**
   * Upload multiple files
   * 1. Nhận files từ temp (upload middleware)
   * 2. Insert vào DB
   * 3. Move files vào thư mục tenant: uploads/{tenantCode}/
   */
  async uploadMultiple(
    files: Express.Multer.File[],
    options: {
      entityId?: string;
      entityType?: EntityTypeEnum;
      category?: FileCategoryEnum;
      isActive?: boolean;
      isPublic?: boolean;
      metadata?: Record<string, any>;
    },
  ): Promise<File[]> {
    const { entityId, entityType, category } = options;
    const results: File[] = [];

    for (const file of files) {
      try {
        // Bỏ qua file rỗng (size = 0) — thường do FE gửi File object chưa load xong
        if (!file.size || file.size === 0) {
          logger.warn(`Skipping empty file: ${file.originalname} (size=0)`);
          continue;
        }

        const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");
        let uploadedPath = file.path;
        let storedFileName = file.filename;
        let storedFileSize = file.size;

        // Chuyển HEIC/HEIF thành JPEG trước khi tạo bản ghi để metadata khớp với file được lưu.
        if (thumbnailUtils.isHeicFile(file.mimetype, originalName)) {
          const jpegBuffer = await this.renderJpeg(file.path, { quality: 90 });
          storedFileName = `${path.parse(file.filename).name}.jpg`;
          uploadedPath = path.join(path.dirname(file.path), storedFileName);
          await fs.writeFile(uploadedPath, jpegBuffer);
          if (uploadedPath !== file.path) {
            await fs.unlink(file.path);
          }
          storedFileSize = jpegBuffer.length;
        }

        // Tạo đường dẫn đích trong thư mục tenant
        const destDir = path.join(
          process.cwd(),
          "uploads",
          entityType || "other",
          entityId || "temp",
          category || "files",
        );
        const destPath = path.join(destDir, storedFileName);

        const type = this.detectFileType(file.mimetype, file.originalname);

        console.log("file.filename", file.filename);

        // Tạo file record trong DB với status PENDING
        const fileData: Partial<File> = {
          fileName: storedFileName,
          originalName: originalName,
          path: destPath,
          url: `/uploads/${entityType || "other"}/${entityId || "temp"}/${category || "files"}/${storedFileName}`,
          size: storedFileSize,
          type,
          entityId: entityId || null,
          entityType: entityType || null,
          thumbnailPath: null,
          thumbnailUrl: null,
          category,
          isPublic: true,
          isMain: false,
          status: options.isActive ? FileStatusEnum.ACTIVE : FileStatusEnum.PENDING,
        };

        const dbFile = await this.fileRepository.create(fileData);

        // Move file từ temp vào thư mục tenant
        await fs.mkdir(destDir, { recursive: true });
        await fs.rename(uploadedPath, destPath);

        // Generate thumbnail nếu là image
        if (type === FileTypeEnum.IMAGE) {
          try {
            const thumbnailData = await this.generateThumbnail(destPath, entityType, entityId, category);
            if (thumbnailData) {
              await this.update(dbFile.id, {
                thumbnailPath: thumbnailData.path,
                thumbnailUrl: thumbnailData.url,
              });
              dbFile.thumbnailPath = thumbnailData.path;
              dbFile.thumbnailUrl = thumbnailData.url;
            }
          } catch (error) {
            logger.error(`Failed to generate thumbnail for ${file.originalname}`, error);
          }
        }

        results.push(dbFile);
      } catch (error) {
        logger.error(`Failed to upload file ${file.originalname}`, error);
      }
    }

    return results;
  }

  /**
   * Delete file - Xóa trong DB và file vật lý
   */
  async deleteFile(fileId: string): Promise<void> {
    // Lấy thông tin file từ DB
    const file = await this.fileRepository.findById(fileId);

    if (!file) {
      throw new NotFoundError(`File not found: ${fileId}`, {
        field: "id",
        code: ErrorsMessages.not_found,
      });
    }

    // Xóa file vật lý
    try {
      await fs.unlink(file.path);
      if (file.thumbnailPath) {
        await fs.unlink(file.thumbnailPath);
      }
    } catch (error) {
      logger.error(`Failed to delete physical file ${file.path}`, error);
    }

    // Xóa trong DB
    await this.delete(fileId);
  }

  /**
   * Set file as main file
   * Đặt file làm main, các file khác trong cùng category thành false
   */
  async setMainFile(fileId: string): Promise<boolean> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError(`File not found: ${fileId}`, {
        field: "id",
        code: ErrorsMessages.not_found,
      });
    }

    if (!file.entityType || !file.entityId || !file.category) {
      throw new Error("File must have entityType, entityId, and category");
    }

    return await this.fileRepository.setMainFile(fileId, file.entityType, file.entityId, file.category);
  }

  /**
   * Cleanup pending files (background job)
   * Xóa các file PENDING đã hết hạn (expiresAt < now)
   */
  async cleanupPendingFiles(): Promise<{
    deleted: number;
    failed: number;
  }> {
    const expiredFiles = await this.fileRepository.findExpiredFiles();

    let deleted = 0;
    let failed = 0;

    for (const file of expiredFiles) {
      try {
        await this.deleteFile(file.id);
        deleted++;
      } catch (error) {
        logger.error(`Failed to cleanup file ${file.id}`, error);
        failed++;
      }
    }

    logger.info(`Cleanup pending files: ${deleted} deleted, ${failed} failed`);

    return { deleted, failed };
  }

  /**
   * Confirm files: Update tempEntityId -> realEntityId
   * Gọi sau khi tạo entity thành công
   */
  async confirmFiles(tempEntityId: string, realEntityId: string): Promise<number> {
    return await this.fileRepository.batchUpdateEntityId(tempEntityId, realEntityId);
  }

  /**
   * Get files by entity, grouped by category
   * Returns: { avatar: [...], album: [...], documents: [...] }
   */
  async getFilesByEntityGrouped(
    entityId: string,
    options?: { includeInactive?: boolean },
  ): Promise<Record<string, File[]>> {
    const files = await this.fileRepository.findByEntity(entityId, {
      status: options?.includeInactive ? undefined : FileStatusEnum.ACTIVE,
    });

    // Group by category
    const grouped: Record<string, File[]> = {};
    for (const file of files) {
      const category = file.category || "other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(file);
    }

    return grouped;
  }

  /**
   * Detect file type từ MIME type
   */
  private detectFileType(mimeType: string, fileName?: string): FileTypeEnum {
    const normalizedMimeType = mimeType || "";
    if (normalizedMimeType.startsWith("image/") || thumbnailUtils.isHeicFile(normalizedMimeType, fileName)) {
      return FileTypeEnum.IMAGE;
    }
    if (normalizedMimeType.startsWith("video/")) return FileTypeEnum.VIDEO;
    if (normalizedMimeType.startsWith("audio/")) return FileTypeEnum.AUDIO;
    if (
      normalizedMimeType.includes("pdf") ||
      normalizedMimeType.includes("document") ||
      normalizedMimeType.includes("text") ||
      normalizedMimeType.includes("sheet") ||
      normalizedMimeType.includes("presentation")
    ) {
      return FileTypeEnum.DOCUMENT;
    }
    return FileTypeEnum.OTHER;
  }

  /**
   * Generate thumbnail cho image
   * Tạo ảnh nhỏ 300x300 (hoặc giữ tỷ lệ nếu ảnh nhỏ hơn)
   */
  private async generateThumbnail(
    imagePath: string,
    entityType?: EntityTypeEnum | null,
    entityId?: string | null,
    category?: FileCategoryEnum,
  ): Promise<{ path: string; url: string } | null> {
    try {
      const parsedPath = path.parse(imagePath);
      // Nội dung thumbnail luôn là JPEG, vì vậy phải dùng .jpg để static server
      // trả đúng Content-Type. Đặc biệt quan trọng với file HEIC/HEIF.
      const thumbnailFilename = `${parsedPath.name}_thumb.jpg`;
      const thumbnailPath = path.join(parsedPath.dir, thumbnailFilename);

      // Generate thumbnail (max 300x300, giữ tỷ lệ)
      const thumbnailBuffer = await this.renderJpeg(imagePath, {
        width: 300,
        height: 300,
        quality: 80,
      });
      await fs.writeFile(thumbnailPath, thumbnailBuffer);

      const thumbnailUrl = `/uploads/${entityType || "other"}/${
        entityId || "temp"
      }/${category || "files"}/${thumbnailFilename}`;

      return {
        path: thumbnailPath,
        url: thumbnailUrl,
      };
    } catch (error) {
      logger.error("Failed to generate thumbnail", error);
      return null;
    }
  }

  private async renderJpeg(
    sourcePath: string,
    options?: { width?: number; height?: number; quality?: number },
  ): Promise<Buffer> {
    const render = (source: string | Buffer) => {
      let pipeline = sharp(source).rotate();
      if (options?.width || options?.height) {
        pipeline = pipeline.resize(options.width, options.height, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }
      return pipeline.jpeg({ quality: options?.quality || 90 }).toBuffer();
    };

    try {
      return await render(sourcePath);
    } catch (error) {
      if (!thumbnailUtils.isHeicFile(undefined, sourcePath)) {
        throw error;
      }

      logger.warn(`Sharp cannot decode HEIC, using heif-convert for ${sourcePath}`);
      const convertedSource = await this.convertHeicToJpeg(sourcePath);
      return render(convertedSource);
    }
  }

  private async convertHeicToJpeg(sourcePath: string): Promise<Buffer> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "thienbao-heic-preview-"));
    const outputPath = path.join(tempDir, "preview.jpg");

    try {
      await execFileAsync("heif-convert", ["-q", "90", sourcePath, outputPath], {
        timeout: 60_000,
        maxBuffer: 1024 * 1024,
      });
      return await fs.readFile(outputPath);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  /**
   * Chuyển ảnh thành JPEG để trình duyệt có thể preview.
   * File gốc không bị thay đổi và vẫn được dùng cho thao tác tải xuống.
   */
  async getPreview(fileId: string): Promise<{ buffer: Buffer; contentType: "image/jpeg" }> {
    const file = await this.fileRepository.findById(fileId);

    if (!file) {
      throw new NotFoundError(`File not found: ${fileId}`, {
        field: "id",
        code: ErrorsMessages.not_found,
      });
    }

    const isImage =
      file.type === FileTypeEnum.IMAGE ||
      /\.(jpe?g|png|webp|gif|bmp|tiff?|heic|heif)$/i.test(file.originalName);
    if (!isImage) {
      throw new BadRequestError("File is not a previewable image");
    }

    try {
      const buffer = await this.renderJpeg(file.path);

      return { buffer, contentType: "image/jpeg" };
    } catch (error) {
      logger.error(`Failed to convert image for preview: ${file.id}`, error);
      throw new BadRequestError("Unable to convert this image for preview");
    }
  }
}
