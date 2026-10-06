import { Transform, Readable } from "stream";
import { pipeline } from "stream/promises";
import * as fs from "fs";
import * as ExcelJS from "exceljs";
import { IHeader } from "@/shared/config/excels";
import { BadRequestError } from "@/shared/types/errors";

export interface IExcelJSStreamingOptions {
  headerData: IHeader[];
  startRow: number;
  startCol: number;
  batchSize?: number;
  worksheetIndex?: number; // Chỉ số worksheet (0-based)
  worksheetName?: string; // Hoặc tên worksheet
  validateRow?: (row: any, rowIndex: number) => { isValid: boolean; errors?: string[] };
  transformRow?: (row: any, rowIndex: number) => any;
  onProgress?: (progress: { processed: number; total: number; percentage: number }) => void;
  onError?: (error: Error, rowIndex: number, row: any) => void;
  maxMemoryUsage?: number; // MB
}

export interface IExcelJSStreamingResult {
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

export class ExcelJSStreamProcessor {
  private memoryUsageHistory: number[] = [];
  private startTime: number = 0;

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
   * Đọc file Excel với ExcelJS streaming
   */
  private async getWorksheet(filePath: string, options: IExcelJSStreamingOptions): Promise<ExcelJS.Worksheet> {
    try {
      const workbook = new ExcelJS.Workbook();

      // Đọc file với stream để tiết kiệm memory
      await workbook.xlsx.readFile(filePath);

      let worksheet: ExcelJS.Worksheet;

      if (options.worksheetName) {
        const foundWorksheet = workbook.getWorksheet(options.worksheetName);
        if (!foundWorksheet) {
          throw new BadRequestError(`Worksheet '${options.worksheetName}' not found`);
        }
        worksheet = foundWorksheet;
      } else {
        const worksheetIndex = options.worksheetIndex || 0;
        const foundWorksheet = workbook.getWorksheet(worksheetIndex + 1); // ExcelJS uses 1-based index
        if (!foundWorksheet) {
          throw new BadRequestError(`Worksheet at index ${worksheetIndex} not found`);
        }
        worksheet = foundWorksheet;
      }

      return worksheet;
    } catch (error: any) {
      throw new BadRequestError(`Failed to read Excel file: ${error.message}`);
    }
  }

  /**
   * Validate headers với ExcelJS
   */
  private validateHeaders(worksheet: ExcelJS.Worksheet, options: IExcelJSStreamingOptions): void {
    try {
      const headerRow = worksheet.getRow(1); // Row 1 cho headers

      for (let i = 0; i < options.headerData.length; i++) {
        const colIndex = i + options.startCol;
        const cell = headerRow.getCell(colIndex);
        const excelHeaderValue = cell.value?.toString() || "";
        const templateHeaderValue = options.headerData[i].header;

        if (!this.compareNormalizedStrings(excelHeaderValue, templateHeaderValue)) {
          throw new BadRequestError(
            `Header mismatch at column ${i}: '${excelHeaderValue}' does not match template '${templateHeaderValue}'`
          );
        }
      }
    } catch (error: any) {
      throw new BadRequestError(`Header validation failed: ${error.message}`);
    }
  }

  /**
   * So sánh chuỗi đã normalize
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
   * Convert ExcelJS row to object
   */
  private rowToObject(row: ExcelJS.Row, headers: IHeader[], startCol: number): any {
    const obj: any = {};

    headers.forEach((header, index) => {
      const colIndex = startCol + index;
      const cell = row.getCell(colIndex);

      // Xử lý giá trị cell
      let value: any = null;

      if (cell.value !== null && cell.value !== undefined) {
        // Xử lý các loại cell khác nhau
        if (typeof cell.value === "object") {
          // Date cell
          if (cell.value instanceof Date) {
            value = cell.value;
          }
          // Formula cell
          else if ("result" in cell.value) {
            value = (cell.value as any).result;
          }
          // Rich text cell
          else if ("richText" in cell.value) {
            value = (cell.value as any).richText.map((rt: any) => rt.text).join("");
          }
          // Hyperlink cell
          else if ("text" in cell.value) {
            value = (cell.value as any).text;
          } else {
            value = cell.value.toString();
          }
        } else {
          value = cell.value;
        }
      }

      obj[header.key] = value;
    });

    return obj;
  }

  /**
   * Create streaming processor với ExcelJS
   */
  private createExcelJSBatchStream<T>(
    worksheet: ExcelJS.Worksheet,
    options: IExcelJSStreamingOptions,
    processorFn: (batch: T[]) => Promise<void>
  ): Readable {
    const processor = this;
    let currentRow = options.startRow;
    let processedCount = 0;
    const batchSize = options.batchSize || 1000;
    const totalRows = worksheet.rowCount;

    return new Readable({
      objectMode: true,

      async read() {
        try {
          // Check if we've processed all rows
          if (currentRow > totalRows) {
            this.push(null); // End stream
            return;
          }

          // Process batch
          const validBatch: T[] = [];
          const errors: Array<{ rowIndex: number; error: string; data?: any }> = [];
          let batchCount = 0;

          // Process rows in current batch
          while (batchCount < batchSize && currentRow <= totalRows) {
            const row = worksheet.getRow(currentRow);

            // Check if row is empty
            if (!row.hasValues) {
              currentRow++;
              continue;
            }

            try {
              // Convert row to object
              let rowData = processor.rowToObject(row, options.headerData, options.startCol);

              // Transform row if transformer provided
              if (options.transformRow) {
                rowData = options.transformRow(rowData, currentRow);
              }

              // Validate row if validator provided
              if (options.validateRow) {
                const validation = options.validateRow(rowData, currentRow);
                if (!validation.isValid) {
                  errors.push({
                    rowIndex: currentRow,
                    error: validation.errors?.join("; ") || "Validation failed",
                    data: rowData,
                  });
                  currentRow++;
                  batchCount++;
                  continue;
                }
              }

              validBatch.push(rowData);
            } catch (error: any) {
              errors.push({
                rowIndex: currentRow,
                error: error.message,
                data: null,
              });

              if (options.onError) {
                options.onError(error, currentRow, null);
              }
            }

            currentRow++;
            batchCount++;
          }

          // Process valid batch
          if (validBatch.length > 0) {
            await processorFn(validBatch);
          }

          processedCount += batchCount;

          // Report progress
          if (options.onProgress) {
            options.onProgress({
              processed: processedCount,
              total: totalRows - options.startRow + 1,
              percentage: Math.min(100, (processedCount / (totalRows - options.startRow + 1)) * 100),
            });
          }

          // Check memory usage
          const memoryUsage = processor.checkMemoryUsage();
          if (options.maxMemoryUsage && memoryUsage > options.maxMemoryUsage) {
            throw new Error(`Memory usage exceeded limit: ${memoryUsage}MB > ${options.maxMemoryUsage}MB`);
          }

          // Force garbage collection periodically
          if (processedCount % (batchSize * 10) === 0 && global.gc) {
            global.gc();
          }

          // Push result
          this.push({
            processed: validBatch.length,
            errors: errors.length,
            errorDetails: errors,
          });

          // If no more rows, end stream
          if (currentRow > totalRows) {
            this.push(null);
          }
        } catch (error) {
          this.emit("error", error);
        }
      },
    });
  }

  /**
   * Process Excel file với ExcelJS streaming
   */
  async processExcelFile<T>(
    filePath: string,
    options: IExcelJSStreamingOptions,
    batchProcessor: (batch: T[]) => Promise<void>
  ): Promise<IExcelJSStreamingResult> {
    this.startTime = Date.now();
    this.memoryUsageHistory = [];

    let totalProcessed = 0;
    let totalErrors = 0;
    const errorDetails: Array<{ rowIndex: number; error: string; data?: any }> = [];

    try {
      // Read Excel file
      console.log("Reading Excel file with ExcelJS...");
      const worksheet = await this.getWorksheet(filePath, options);
      console.log(`Total rows detected: ${worksheet.rowCount}`);
      console.log(`Worksheet name: ${worksheet.name}`);

      // Validate headers
      this.validateHeaders(worksheet, options);
      console.log("Headers validated successfully");

      // Create streaming processor
      const batchStream = this.createExcelJSBatchStream<T>(worksheet, options, batchProcessor);

      // Process stream
      for await (const result of batchStream) {
        if (result && typeof result === "object") {
          totalProcessed += result.processed || 0;
          totalErrors += result.errors || 0;
          if (result.errorDetails) {
            errorDetails.push(...result.errorDetails);
          }
        }
      }

      const processingTime = Date.now() - this.startTime;
      const memoryStats = this.calculateMemoryStats();

      console.log(`Processing completed: ${totalProcessed} processed, ${totalErrors} errors`);

      return {
        totalProcessed,
        totalErrors,
        errorDetails,
        processingTime,
        memoryUsage: memoryStats,
      };
    } catch (error: any) {
      console.error("Error processing Excel file with ExcelJS:", error);
      throw error;
    }
  }

  /**
   * Stream worksheet rows with iterator (Alternative approach)
   */
  async *streamWorksheetRows(filePath: string, options: IExcelJSStreamingOptions): AsyncGenerator<any, void, unknown> {
    try {
      const worksheet = await this.getWorksheet(filePath, options);

      // Validate headers
      this.validateHeaders(worksheet, options);

      // Iterate through rows
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber < options.startRow) return;

        try {
          let rowData = this.rowToObject(row, options.headerData, options.startCol);

          // Transform row if transformer provided
          if (options.transformRow) {
            rowData = options.transformRow(rowData, rowNumber);
          }

          // Validate row if validator provided
          if (options.validateRow) {
            const validation = options.validateRow(rowData, rowNumber);
            if (!validation.isValid) {
              if (options.onError) {
                options.onError(new Error(validation.errors?.join("; ") || "Validation failed"), rowNumber, rowData);
              }
              return;
            }
          }

          return rowData;
        } catch (error: any) {
          if (options.onError) {
            options.onError(error, rowNumber, null);
          }
          return null;
        }
      });
    } catch (error: any) {
      throw new BadRequestError(`Failed to stream worksheet: ${error.message}`);
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

export default ExcelJSStreamProcessor;
