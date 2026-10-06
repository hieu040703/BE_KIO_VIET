import sharp from "sharp";
import logger from "./logger";

/**
 * Thumbnail Configuration
 */
export interface ThumbnailConfig {
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

/**
 * Thumbnail Result
 */
export interface ThumbnailResult {
  buffer: Buffer;
  size: number;
  format: string;
  width: number;
  height: number;
}

/**
 * Thumbnail Utilities Class
 * Các phương thức hỗ trợ tạo thumbnail cho ảnh
 */
export class ThumbnailUtils {
  // Default configurations
  private readonly defaultConfig: ThumbnailConfig = {
    width: 300,
    height: 300,
    fit: "cover",
    quality: 80,
    format: "jpeg",
  };

  /**
   * Kiểm tra file có phải là ảnh không
   */
  isImageFile(mimeType?: string): boolean {
    if (!mimeType) return false;
    return mimeType.startsWith("image/");
  }

  /**
   * Kiểm tra file có hỗ trợ tạo thumbnail không
   */
  isSupportedImageFormat(mimeType?: string): boolean {
    if (!mimeType) return false;
    const normalizedMimeType = mimeType.toLowerCase().split(";")[0].trim();
    const supportedFormats = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/tiff",
      "image/svg+xml",
      "image/bmp",
      "image/heic",
      "image/heif",
      "image/heic-sequence",
      "image/heif-sequence",
    ];
    return supportedFormats.includes(normalizedMimeType);
  }

  /**
   * Kiểm tra file HEIC/HEIF theo cả MIME type và tên file.
   * Một số trình duyệt gửi MIME type rỗng hoặc application/octet-stream cho HEIC.
   */
  isHeicFile(mimeType?: string, fileName?: string): boolean {
    const normalizedMimeType = mimeType?.toLowerCase().split(";")[0].trim();
    if (
      normalizedMimeType === "image/heic" ||
      normalizedMimeType === "image/heif" ||
      normalizedMimeType === "image/heic-sequence" ||
      normalizedMimeType === "image/heif-sequence"
    ) {
      return true;
    }

    return /\.(heic|heif)$/i.test(fileName || "");
  }

  /**
   * Tạo thumbnail từ buffer
   */
  async createThumbnail(imageBuffer: Buffer, config?: Partial<ThumbnailConfig>): Promise<ThumbnailResult> {
    try {
      const finalConfig = { ...this.defaultConfig, ...config };

      let sharpInstance = sharp(imageBuffer);

      // Resize với config
      sharpInstance = sharpInstance.resize(finalConfig.width, finalConfig.height, {
        fit: finalConfig.fit,
        withoutEnlargement: true, // Không phóng to ảnh nhỏ hơn
      });

      // Convert format
      if (finalConfig.format === "jpeg") {
        sharpInstance = sharpInstance.jpeg({ quality: finalConfig.quality });
      } else if (finalConfig.format === "png") {
        sharpInstance = sharpInstance.png({ quality: finalConfig.quality });
      } else if (finalConfig.format === "webp") {
        sharpInstance = sharpInstance.webp({ quality: finalConfig.quality });
      }

      // Generate thumbnail
      const buffer = await sharpInstance.toBuffer({ resolveWithObject: true });

      return {
        buffer: buffer.data,
        size: buffer.info.size,
        format: buffer.info.format,
        width: buffer.info.width,
        height: buffer.info.height,
      };
    } catch (error) {
      logger.error("Error creating thumbnail:", error);
      throw new Error(`Failed to create thumbnail: ${error}`);
    }
  }

  /**
   * Tạo nhiều thumbnail với kích thước khác nhau
   */
  async createMultipleThumbnails(
    imageBuffer: Buffer,
    sizes: Array<{ name: string; width: number; height: number }>,
  ): Promise<Array<{ name: string; result: ThumbnailResult }>> {
    try {
      const thumbnails = await Promise.all(
        sizes.map(async (size) => {
          const result = await this.createThumbnail(imageBuffer, {
            width: size.width,
            height: size.height,
          });
          return {
            name: size.name,
            result,
          };
        }),
      );

      return thumbnails;
    } catch (error) {
      logger.error("Error creating multiple thumbnails:", error);
      throw error;
    }
  }

  /**
   * Tạo thumbnail với preset size
   */
  async createThumbnailPreset(imageBuffer: Buffer, preset: "small" | "medium" | "large"): Promise<ThumbnailResult> {
    const presets = {
      small: { width: 150, height: 150 },
      medium: { width: 300, height: 300 },
      large: { width: 600, height: 600 },
    };

    return this.createThumbnail(imageBuffer, presets[preset]);
  }

  /**
   * Lấy metadata của ảnh
   */
  async getImageMetadata(imageBuffer: Buffer): Promise<sharp.Metadata> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      return metadata;
    } catch (error) {
      logger.error("Error getting image metadata:", error);
      throw error;
    }
  }

  /**
   * Generate tên file thumbnail
   */
  generateThumbnailName(originalName: string, suffix: string = "thumb"): string {
    const lastDotIndex = originalName.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return `${originalName}_${suffix}`;
    }

    const nameWithoutExt = originalName.substring(0, lastDotIndex);
    const ext = originalName.substring(lastDotIndex);
    return `${nameWithoutExt}_${suffix}${ext}`;
  }

  /**
   * Optimize ảnh (giảm dung lượng mà vẫn giữ chất lượng tốt)
   */
  async optimizeImage(imageBuffer: Buffer, quality: number = 85): Promise<ThumbnailResult> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      let sharpInstance = sharp(imageBuffer);

      // Giữ nguyên kích thước, chỉ optimize
      if (metadata.format === "jpeg" || metadata.format === "jpg") {
        sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
      } else if (metadata.format === "png") {
        sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
      } else if (metadata.format === "webp") {
        sharpInstance = sharpInstance.webp({ quality });
      }

      const buffer = await sharpInstance.toBuffer({ resolveWithObject: true });

      return {
        buffer: buffer.data,
        size: buffer.info.size,
        format: buffer.info.format,
        width: buffer.info.width,
        height: buffer.info.height,
      };
    } catch (error) {
      logger.error("Error optimizing image:", error);
      throw error;
    }
  }

  /**
   * Resize ảnh giữ tỷ lệ
   */
  async resizeImage(imageBuffer: Buffer, maxWidth: number, maxHeight: number): Promise<ThumbnailResult> {
    try {
      const sharpInstance = sharp(imageBuffer).resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });

      const buffer = await sharpInstance.toBuffer({ resolveWithObject: true });

      return {
        buffer: buffer.data,
        size: buffer.info.size,
        format: buffer.info.format,
        width: buffer.info.width,
        height: buffer.info.height,
      };
    } catch (error) {
      logger.error("Error resizing image:", error);
      throw error;
    }
  }

  /**
   * Convert ảnh sang format khác
   */
  async convertFormat(
    imageBuffer: Buffer,
    format: "jpeg" | "png" | "webp",
    quality: number = 85,
  ): Promise<ThumbnailResult> {
    try {
      let sharpInstance = sharp(imageBuffer);

      if (format === "jpeg") {
        sharpInstance = sharpInstance.jpeg({ quality });
      } else if (format === "png") {
        sharpInstance = sharpInstance.png({ quality });
      } else if (format === "webp") {
        sharpInstance = sharpInstance.webp({ quality });
      }

      const buffer = await sharpInstance.toBuffer({ resolveWithObject: true });

      return {
        buffer: buffer.data,
        size: buffer.info.size,
        format: buffer.info.format,
        width: buffer.info.width,
        height: buffer.info.height,
      };
    } catch (error) {
      logger.error("Error converting image format:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const thumbnailUtils = new ThumbnailUtils();

// Export default
export default thumbnailUtils;
