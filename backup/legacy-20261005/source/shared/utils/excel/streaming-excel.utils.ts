import { Transform, Readable } from "stream";
import { pipeline } from "stream/promises";
import ExcelJS from "exceljs";
import { BadRequestError } from "../../types/errors";
import * as fs from "fs";
import * as path from "path";
import { IHeader } from "@/shared/config/excels";

export interface IStreamingExcelOptions {
  headerData: IHeader[];
  startRow: number;
  startCol: number;
  batchSize?: number;
  validateRow?: (row: any, rowIndex: number) => { isValid: boolean; errors?: string[] };
  transformRow?: (row: any, rowIndex: number) => any;
  onProgress?: (progress: { processed: number; total: number; percentage: number }) => void;
  onError?: (error: Error, rowIndex: number, row: any) => void;
  maxMemoryUsage?: number; // MB
}

export interface IStreamingResult {
  totalProcessed: number;
  totalErrors: number;
  errorDetails: Array<{ rowIndex: number; error: string; data?: any }>;
  processingTime: number;
  memoryUsage: {
    peak: number;
    average: number;
    final: number;
  };
}

export class StreamingExcelProcessor {
  private memoryUsageHistory: number[] = [];
  private startTime: number = 0;
  private totalRows: number = 0;

  /**
   * Kiểm tra memory usage hiện tại
   */
  private checkMemoryUsage(): number {
    const usage = process.memoryUsage();
    const memoryInMB = usage.heapUsed / 1024 / 1024;
    this.memoryUsageHistory.push(memoryInMB);
    return memoryInMB;
  }

  /**
   * Ước tính tổng số dòng trong file Excel mà không load toàn bộ
   */
  private async estimateRowCount(filePath: string): Promise<number> {
    try {
      const workbook = new ExcelJS.Workbook();
      const stream = fs.createReadStream(filePath);

      // Chỉ đọc metadata của file để ước tính
      await workbook.xlsx.read(stream);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new BadRequestError("File không đúng định dạng");
      }

      // Ước tính dựa trên dimension của worksheet
      const rowCount = worksheet.actualRowCount || worksheet.rowCount || 0;

      // Cleanup
      workbook.removeWorksheet(worksheet.id);

      return Math.max(0, rowCount - 1); // Trừ đi header row
    } catch (error) {
      console.warn("Cannot estimate row count, using default estimation");
      return 100000; // Default estimation
    }
  }

  /**
   * Tạo stream reader cho Excel file với memory optimization
   */
  private createExcelStream(filePath: string, options: IStreamingExcelOptions): Readable {
    const processor = this;
    let currentRow = 0;
    let worksheet: ExcelJS.Worksheet | undefined;
    let workbook: ExcelJS.Workbook;
    let headers: string[];
    let isHeaderProcessed = false;

    return new Readable({
      objectMode: true,
      highWaterMark: options.batchSize || 100, // Giảm buffer size

      async read() {
        try {
          if (!workbook) {
            // Khởi tạo workbook và worksheet
            workbook = new ExcelJS.Workbook();

            // Sử dụng streaming read thay vì load toàn bộ file
            const stream = fs.createReadStream(filePath);
            await workbook.xlsx.read(stream);

            worksheet = workbook.getWorksheet(1);
            if (!worksheet) {
              this.emit("error", new BadRequestError("File không đúng định dạng"));
              return;
            }

            headers = options.headerData.map((h) => h.key);

            // Validate headers
            if (!isHeaderProcessed) {
              await processor.validateHeaders(worksheet, options);
              isHeaderProcessed = true;
            }
          }

          if (!worksheet) {
            this.emit("error", new BadRequestError("Worksheet not found"));
            return;
          }

          // Đọc từng dòng một cách tuần tự
          currentRow++;
          const actualRow = currentRow + options.startRow;

          const row = worksheet.getRow(actualRow);

          // Kiểm tra nếu dòng trống hoặc đã hết dữ liệu
          if (!row || processor.isRowEmpty(row, options.startCol, headers.length)) {
            // Cleanup memory
            if (workbook && worksheet) {
              workbook.removeWorksheet(worksheet.id);
            }
            this.push(null); // End stream
            return;
          }

          // Parse row data
          const rowData = processor.parseRowData(row, headers, options);

          // Transform row if transformer provided
          const transformedData = options.transformRow ? options.transformRow(rowData, currentRow) : rowData;

          // Validate row if validator provided
          if (options.validateRow) {
            const validation = options.validateRow(transformedData, currentRow);
            if (!validation.isValid) {
              const error = {
                rowIndex: currentRow,
                error: validation.errors?.join("; ") || "Validation failed",
                data: transformedData,
              };

              if (options.onError) {
                options.onError(new Error(error.error), currentRow, transformedData);
              }

              // Continue processing despite error
              this.push({ type: "error", data: error });
              return;
            }
          }

          // Push valid data
          this.push({ type: "data", data: transformedData, rowIndex: currentRow });

          // Check memory usage periodically
          if (currentRow % 1000 === 0) {
            const memoryUsage = processor.checkMemoryUsage();
            if (options.maxMemoryUsage && memoryUsage > options.maxMemoryUsage) {
              this.emit(
                "error",
                new Error(`Memory usage exceeded limit: ${memoryUsage}MB > ${options.maxMemoryUsage}MB`)
              );
              return;
            }

            // Force garbage collection if available
            if (global.gc) {
              global.gc();
            }
          }
        } catch (error) {
          this.emit("error", error);
        }
      },
    });
  }

  /**
   * Validate headers trong Excel file
   */
  private async validateHeaders(worksheet: ExcelJS.Worksheet, options: IStreamingExcelOptions): Promise<void> {
    for (let i = 0; i < options.headerData.length; i++) {
      const excelHeaderValue = worksheet.getCell(options.startRow, i + options.startCol).value;
      const templateHeaderValue = options.headerData[i].header;

      if (!this.compareNormalizedStrings(excelHeaderValue, templateHeaderValue)) {
        throw new BadRequestError(
          `Header mismatch at column ${i}: '${excelHeaderValue}' does not match template '${templateHeaderValue}'`
        );
      }
    }
  }

  /**
   * So sánh chuỗi đã normalize (từ ExcelUtils)
   */
  private compareNormalizedStrings(value1: any, value2: any): boolean {
    const normalize = (value: any): string => {
      if (value === null || value === undefined) return "";
      let str = String(value);

      try {
        str = str.normalize("NFD").normalize("NFC");
      } catch (e) {
        console.warn("Unicode normalization failed:", e);
      }

      str = str.replace(/[\u00A0\u2000-\u200B\u2028\u2029\u3000]/g, " ");
      str = str.replace(/[\u200B-\u200D\uFEFF]/g, "");
      return str.trim().replace(/\s+/g, " ");
    };

    const normalized1 = normalize(value1);
    const normalized2 = normalize(value2);

    if (normalized1 === normalized2) return true;

    // Fuzzy comparison without diacritics
    const removeDiacritics = (str: string): string => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .normalize("NFC");
    };

    return removeDiacritics(normalized1.toLowerCase()) === removeDiacritics(normalized2.toLowerCase());
  }

  /**
   * Kiểm tra nếu dòng trống
   */
  private isRowEmpty(row: ExcelJS.Row, startCol: number, colCount: number): boolean {
    for (let i = startCol; i < startCol + colCount; i++) {
      const cell = row.getCell(i);
      if (cell.value !== null && cell.value !== undefined && cell.value !== "") {
        return false;
      }
    }
    return true;
  }

  /**
   * Parse dữ liệu từ Excel row
   */
  private parseRowData(row: ExcelJS.Row, headers: string[], options: IStreamingExcelOptions): any {
    const rowData: any = {};

    for (let j = 0; j < headers.length; j++) {
      const cell = row.getCell(j + options.startCol);
      let cellValue = null;

      if (cell.value !== null && typeof cell.value === "object") {
        if ("result" in cell.value) {
          cellValue = (cell.value as any).result;
        } else if ("text" in cell.value) {
          cellValue = (cell.value as any).text;
        } else {
          cellValue = cell.value;
        }
      } else {
        cellValue = cell.value;
      }

      // Clean string values
      if (typeof cellValue === "string") {
        cellValue = cellValue.trim();
        if (cellValue === "") {
          cellValue = null;
        }
      }

      rowData[headers[j]] = cellValue;
    }

    return rowData;
  }

  /**
   * Tạo batch processor stream
   */
  private createBatchProcessor<T>(batchSize: number, processorFn: (batch: T[]) => Promise<void>): Transform {
    let batch: T[] = [];
    let processedCount = 0;

    return new Transform({
      objectMode: true,

      async transform(chunk, encoding, callback) {
        try {
          if (chunk.type === "data") {
            batch.push(chunk.data);

            if (batch.length >= batchSize) {
              await processorFn(batch);
              processedCount += batch.length;

              // Report progress
              this.push({
                type: "progress",
                processed: processedCount,
                batchSize: batch.length,
              });

              batch = []; // Clear batch

              // Force garbage collection after each batch
              if (global.gc) {
                global.gc();
              }
            }
          } else if (chunk.type === "error") {
            // Pass error through
            this.push(chunk);
          }

          callback();
        } catch (error) {
          callback(error instanceof Error ? error : new Error(String(error)));
        }
      },

      async flush(callback) {
        try {
          // Process remaining items in batch
          if (batch.length > 0) {
            await processorFn(batch);
            processedCount += batch.length;

            this.push({
              type: "progress",
              processed: processedCount,
              batchSize: batch.length,
            });
          }

          callback();
        } catch (error) {
          callback(error instanceof Error ? error : new Error(String(error)));
        }
      },
    });
  }

  /**
   * Process Excel file with streaming approach
   */
  async processExcelFile<T>(
    filePath: string,
    options: IStreamingExcelOptions,
    batchProcessor: (batch: T[]) => Promise<void>
  ): Promise<IStreamingResult> {
    this.startTime = Date.now();
    this.memoryUsageHistory = [];

    let totalProcessed = 0;
    let totalErrors = 0;
    const errorDetails: Array<{ rowIndex: number; error: string; data?: any }> = [];

    try {
      // Estimate total rows for progress tracking
      this.totalRows = await this.estimateRowCount(filePath);

      const excelStream = this.createExcelStream(filePath, options);
      const batchStream = this.createBatchProcessor(options.batchSize || 500, batchProcessor);

      // Setup progress tracking
      batchStream.on("data", (chunk) => {
        if (chunk.type === "progress") {
          totalProcessed += chunk.batchSize;

          if (options.onProgress) {
            options.onProgress({
              processed: totalProcessed,
              total: this.totalRows,
              percentage: Math.min(100, (totalProcessed / this.totalRows) * 100),
            });
          }
        } else if (chunk.type === "error") {
          totalErrors++;
          errorDetails.push(chunk.data);
        }
      });

      // Process stream pipeline
      await pipeline(excelStream, batchStream);

      const processingTime = Date.now() - this.startTime;
      const memoryStats = this.calculateMemoryStats();

      return {
        totalProcessed,
        totalErrors,
        errorDetails,
        processingTime,
        memoryUsage: memoryStats,
      };
    } catch (error) {
      console.error("Error processing Excel file:", error);
      throw error;
    }
  }

  /**
   * Calculate memory usage statistics
   */
  private calculateMemoryStats() {
    if (this.memoryUsageHistory.length === 0) {
      return { peak: 0, average: 0, final: 0 };
    }

    const peak = Math.max(...this.memoryUsageHistory);
    const average = this.memoryUsageHistory.reduce((a, b) => a + b, 0) / this.memoryUsageHistory.length;
    const final = this.checkMemoryUsage();

    return { peak, average, final };
  }
}

export default StreamingExcelProcessor;
