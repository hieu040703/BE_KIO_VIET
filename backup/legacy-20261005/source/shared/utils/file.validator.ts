import fs from "fs";
import { Workbook, Worksheet } from "exceljs";
import { BadRequestError } from "@/shared/types/errors";
import logger from "@/shared/utils/logger";

export interface FileValidationConfig {
  maxFileSize?: number; // in bytes, default 50MB
  maxRows?: number; // default 50000 rows
  throwError?: boolean; // throw error or return validation result
}

export interface FileValidationResult {
  isValid: boolean;
  fileSizeInMB: number;
  rowCount?: number;
  error?: string;
}

export class FileValidator {
  /**
   * Validate file size before reading
   */
  static validateFileSize(filePath: string, config: FileValidationConfig = {}): FileValidationResult {
    const MAX_FILE_SIZE = config.maxFileSize || 50 * 1024 * 1024; // 50MB default

    try {
      const fileStats = fs.statSync(filePath);
      const fileSizeInMB = Number((fileStats.size / (1024 * 1024)).toFixed(2));

      logger.info(`📊 File size: ${fileSizeInMB}MB (Max: ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB)`);

      if (fileStats.size > MAX_FILE_SIZE) {
        const error = `File quá lớn (${fileSizeInMB}MB). Vui lòng upload file nhỏ hơn ${(
          MAX_FILE_SIZE /
          (1024 * 1024)
        ).toFixed(0)}MB hoặc chia nhỏ file Excel.`;

        if (config.throwError !== false) {
          throw new BadRequestError(error);
        }

        return {
          isValid: false,
          fileSizeInMB,
          error,
        };
      }

      return {
        isValid: true,
        fileSizeInMB,
      };
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;

      const errorMsg = `Không thể đọc file: ${error.message}`;
      if (config.throwError !== false) {
        throw new BadRequestError(errorMsg);
      }

      return {
        isValid: false,
        fileSizeInMB: 0,
        error: errorMsg,
      };
    }
  }

  /**
   * Validate worksheet row count after reading
   */
  static validateWorksheetRows(worksheet: Worksheet, config: FileValidationConfig = {}): FileValidationResult {
    const MAX_ROWS = config.maxRows || 50000; // 50k rows default

    const actualRowCount = worksheet.actualRowCount;

    logger.info(`📊 Total rows: ${actualRowCount} (Max: ${MAX_ROWS})`);

    if (actualRowCount > MAX_ROWS) {
      const error = `File có quá nhiều dòng (${actualRowCount} dòng). Vui lòng chia nhỏ file, mỗi file tối đa ${MAX_ROWS} dòng.`;

      if (config.throwError !== false) {
        throw new BadRequestError(error);
      }

      return {
        isValid: false,
        fileSizeInMB: 0,
        rowCount: actualRowCount,
        error,
      };
    }

    return {
      isValid: true,
      fileSizeInMB: 0,
      rowCount: actualRowCount,
    };
  }

  /**
   * Validate both file size and row count
   */
  static async validateExcelFile(
    filePath: string,
    workbook: Workbook,
    config: FileValidationConfig = {}
  ): Promise<FileValidationResult> {
    // Step 1: Validate file size
    const sizeValidation = this.validateFileSize(filePath, config);
    if (!sizeValidation.isValid) {
      return sizeValidation;
    }

    // Step 2: Validate row count
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      const error = "File không đúng định dạng hoặc không có worksheet";
      if (config.throwError !== false) {
        throw new BadRequestError(error);
      }
      return {
        isValid: false,
        fileSizeInMB: sizeValidation.fileSizeInMB,
        error,
      };
    }

    const rowValidation = this.validateWorksheetRows(worksheet, config);

    return {
      isValid: rowValidation.isValid,
      fileSizeInMB: sizeValidation.fileSizeInMB,
      rowCount: rowValidation.rowCount,
      error: rowValidation.error,
    };
  }

  /**
   * Get estimated memory usage for Excel file
   */
  static estimateMemoryUsage(fileSizeInMB: number, rowCount: number): number {
    // Rough estimation: file size * 10 + row count * 0.5KB
    // Excel files when loaded into memory can be 5-15x larger
    const memoryFromFile = fileSizeInMB * 10; // MB
    const memoryFromRows = (rowCount * 0.5) / 1024; // MB
    return memoryFromFile + memoryFromRows;
  }

  /**
   * Check if system has enough memory for processing
   */
  static checkAvailableMemory(requiredMemoryMB: number): boolean {
    const totalHeapSize = process.memoryUsage().heapTotal / (1024 * 1024);
    const usedHeapSize = process.memoryUsage().heapUsed / (1024 * 1024);
    const availableMemory = totalHeapSize - usedHeapSize;

    logger.info(
      `💾 Memory: Used ${usedHeapSize.toFixed(2)}MB / Total ${totalHeapSize.toFixed(
        2
      )}MB / Available ${availableMemory.toFixed(2)}MB`
    );
    logger.info(`💾 Required: ${requiredMemoryMB.toFixed(2)}MB`);

    return availableMemory > requiredMemoryMB * 1.5; // Need 1.5x buffer
  }

  /**
   * ✅ Validate file size to row ratio
   * Detect files with abnormal size (lots of media/formatting)
   */
  static validateFileSizeRatio(
    fileSizeInMB: number,
    rowCount: number,
    config: FileValidationConfig = {}
  ): FileValidationResult {
    // Normal Excel: ~5-50KB per row with data only
    // Abnormal: >500KB per row (có media, formatting phức tạp)
    const MAX_MB_PER_1000_ROWS = 5; // 5MB per 1000 rows is acceptable
    const mbPer1000Rows = (fileSizeInMB / rowCount) * 1000;

    logger.info(`📊 File size ratio: ${mbPer1000Rows.toFixed(2)}MB per 1000 rows (Max: ${MAX_MB_PER_1000_ROWS}MB)`);

    if (mbPer1000Rows > MAX_MB_PER_1000_ROWS) {
      const error = `File có dung lượng bất thường (${fileSizeInMB}MB cho ${rowCount} dòng = ${mbPer1000Rows.toFixed(
        2
      )}MB/1000 dòng). File có thể chứa hình ảnh, formatting phức tạp. Vui lòng làm sạch file trước khi upload.`;

      if (config.throwError !== false) {
        throw new BadRequestError(error);
      }

      return {
        isValid: false,
        fileSizeInMB,
        rowCount,
        error,
      };
    }

    return {
      isValid: true,
      fileSizeInMB,
      rowCount,
    };
  }

  /**
   * ✅ Comprehensive validation with memory check
   */
  static async validateExcelFileComprehensive(
    filePath: string,
    worksheet: Worksheet,
    config: FileValidationConfig = {}
  ): Promise<FileValidationResult> {
    // Step 1: File size validation
    const sizeValidation = this.validateFileSize(filePath, config);
    if (!sizeValidation.isValid) {
      return sizeValidation;
    }

    // Step 2: Row count validation
    const rowValidation = this.validateWorksheetRows(worksheet, config);
    if (!rowValidation.isValid) {
      return rowValidation;
    }

    // Step 3: File size ratio validation (detect abnormal files)
    const ratioValidation = this.validateFileSizeRatio(sizeValidation.fileSizeInMB, rowValidation.rowCount!, config);
    if (!ratioValidation.isValid) {
      return ratioValidation;
    }

    // Step 4: Memory availability check
    const estimatedMemory = this.estimateMemoryUsage(sizeValidation.fileSizeInMB, rowValidation.rowCount!);
    const hasEnoughMemory = this.checkAvailableMemory(estimatedMemory);

    if (!hasEnoughMemory) {
      const error = `Hệ thống không đủ bộ nhớ để xử lý file này (cần ~${estimatedMemory.toFixed(
        0
      )}MB). Vui lòng thử lại sau hoặc chia nhỏ file.`;

      if (config.throwError !== false) {
        throw new BadRequestError(error);
      }

      return {
        isValid: false,
        fileSizeInMB: sizeValidation.fileSizeInMB,
        rowCount: rowValidation.rowCount,
        error,
      };
    }

    return {
      isValid: true,
      fileSizeInMB: sizeValidation.fileSizeInMB,
      rowCount: rowValidation.rowCount,
    };
  }
}
