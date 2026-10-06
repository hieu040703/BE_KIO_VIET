import { Transform, Readable } from "stream";
import { pipeline } from "stream/promises";
import * as fs from "fs";
import * as XLSX from "xlsx";
import { BadRequestError } from "../../types/errors";
import { IHeader } from "@/shared/config/excels";

export interface ISimpleStreamingOptions {
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

export interface ISimpleStreamingResult {
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

export class SimpleExcelProcessor {
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
   * Validate file Excel trước khi xử lý
   */
  private validateExcelFile(filePath: string): void {
    try {
      // Kiểm tra file có tồn tại không
      if (!require("fs").existsSync(filePath)) {
        throw new BadRequestError(`Excel file not found: ${filePath}`);
      }

      // Kiểm tra extension
      const validExtensions = [".xlsx", ".xls", ".xlsm", ".xlsb"];
      const fileExtension = require("path").extname(filePath).toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        throw new BadRequestError(
          `Invalid file format. Expected Excel file (.xlsx, .xls, .xlsm, .xlsb), got: ${fileExtension}`
        );
      }

      // Kiểm tra file size (tối đa 100MB)
      const stats = require("fs").statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      if (fileSizeInMB > 100) {
        console.warn(
          `Warning: Large file detected (${fileSizeInMB.toFixed(2)}MB). Consider using smaller batch sizes.`
        );
      }
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError(`File validation failed: ${error.message}`);
    }
  }

  /**
   * Đọc file Excel với XLSX library (ít memory hơn ExcelJS)
   */
  private readExcelFile(filePath: string): { worksheet: XLSX.WorkSheet; totalRows: number } {
    try {
      // Đọc file với options để tối ưu memory
      const workbook = XLSX.readFile(filePath, {
        sheetStubs: false, // Không đọc empty cells
        dense: false, // Sử dụng sparse format
        codepage: 65001, // UTF-8
      });

      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new BadRequestError("No worksheet found");
      }

      const worksheet = workbook.Sheets[firstSheetName];

      // Kiểm tra worksheet có tồn tại không
      if (!worksheet) {
        throw new BadRequestError(`Worksheet '${firstSheetName}' not found or empty`);
      }

      // Kiểm tra worksheet có data không
      if (!worksheet["!ref"]) {
        console.warn(`Warning: Worksheet '${firstSheetName}' appears to be empty`);
        return { worksheet, totalRows: 0 };
      }

      // Estimate total rows
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      const totalRows = Math.max(0, range.e.r - range.s.r);

      return { worksheet, totalRows };
    } catch (error: any) {
      throw new BadRequestError(`Failed to read Excel file: ${error.message}`);
    }
  }

  /**
   * Convert worksheet range to array of objects
   */
  private worksheetToObjects(worksheet: XLSX.WorkSheet, startRow: number, endRow: number, headers: string[]): any[] {
    try {
      // Kiểm tra worksheet có data không
      if (!worksheet["!ref"]) {
        console.warn(`Warning: Worksheet is empty, returning empty array`);
        return [];
      }

      // Create a sub-range for processing
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      const actualEndRow = Math.min(endRow, range.e.r);
      const actualStartRow = Math.max(startRow, range.s.r);

      if (actualStartRow > actualEndRow) {
        return [];
      }

      // Create sub-worksheet for this range
      const subRange = XLSX.utils.encode_range({
        s: { r: actualStartRow, c: range.s.c },
        e: { r: actualEndRow, c: range.e.c },
      });

      // Convert to JSON with custom headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        range: subRange,
        header: headers,
        defval: null,
        blankrows: false,
      });

      return jsonData;
    } catch (error: any) {
      console.warn(`Warning converting worksheet range ${startRow}-${endRow}:`, error.message);
      return [];
    }
  }

  /**
   * Validate headers
   */
  private validateHeaders(worksheet: XLSX.WorkSheet, options: ISimpleStreamingOptions): void {
    try {
      // Kiểm tra worksheet có data không
      if (!worksheet["!ref"]) {
        throw new BadRequestError("Cannot validate headers: worksheet is empty");
      }

      const range = XLSX.utils.decode_range(worksheet["!ref"]);

      for (let i = 0; i < options.headerData.length; i++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: i + options.startCol - 1 }); // Always check row 0 for headers
        const cell = worksheet[cellRef];
        const excelHeaderValue = cell ? cell.v : "";
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
   * Create streaming processor
   */
  private createBatchStream<T>(
    worksheet: XLSX.WorkSheet,
    options: ISimpleStreamingOptions,
    totalRows: number,
    processorFn: (batch: T[]) => Promise<void>
  ): Readable {
    const processor = this;
    let currentBatch = 0;
    let processedCount = 0;
    const batchSize = options.batchSize || 1000;
    const headers = options.headerData.map((h) => h.key);

    return new Readable({
      objectMode: true,

      async read() {
        try {
          const startRow = options.startRow + currentBatch * batchSize;
          const endRow = startRow + batchSize - 1;

          // Check if we've processed all rows
          if (startRow > totalRows) {
            this.push(null); // End stream
            return;
          }

          // Get batch data
          const batchData = processor.worksheetToObjects(worksheet, startRow, endRow, headers);

          if (batchData.length === 0) {
            this.push(null); // End stream
            return;
          }

          // Process batch
          const validBatch: T[] = [];
          const errors: Array<{ rowIndex: number; error: string; data?: any }> = [];

          for (let i = 0; i < batchData.length; i++) {
            const rowIndex = startRow + i;
            let rowData = batchData[i];

            try {
              // Transform row if transformer provided
              if (options.transformRow) {
                rowData = options.transformRow(rowData, rowIndex);
              }

              // Validate row if validator provided
              if (options.validateRow) {
                const validation = options.validateRow(rowData, rowIndex);
                if (!validation.isValid) {
                  errors.push({
                    rowIndex,
                    error: validation.errors?.join("; ") || "Validation failed",
                    data: rowData,
                  });
                  continue;
                }
              }

              validBatch.push(rowData);
            } catch (error: any) {
              errors.push({
                rowIndex,
                error: error.message,
                data: rowData,
              });

              if (options.onError) {
                options.onError(error, rowIndex, rowData);
              }
            }
          }

          // Process valid batch
          if (validBatch.length > 0) {
            await processorFn(validBatch);
          }

          processedCount += batchData.length;
          currentBatch++;

          // Report progress
          if (options.onProgress) {
            options.onProgress({
              processed: processedCount,
              total: totalRows,
              percentage: Math.min(100, (processedCount / totalRows) * 100),
            });
          }

          // Check memory usage
          const memoryUsage = processor.checkMemoryUsage();
          if (options.maxMemoryUsage && memoryUsage > options.maxMemoryUsage) {
            throw new Error(`Memory usage exceeded limit: ${memoryUsage}MB > ${options.maxMemoryUsage}MB`);
          }

          // Force garbage collection periodically
          if (currentBatch % 10 === 0 && global.gc) {
            global.gc();
          }

          // Push result
          this.push({
            processed: validBatch.length,
            errors: errors.length,
            errorDetails: errors,
          });
        } catch (error) {
          this.emit("error", error);
        }
      },
    });
  }

  /**
   * Process Excel file with simplified streaming approach
   */
  async processExcelFile<T>(
    filePath: string,
    options: ISimpleStreamingOptions,
    batchProcessor: (batch: T[]) => Promise<void>
  ): Promise<ISimpleStreamingResult> {
    this.startTime = Date.now();
    this.memoryUsageHistory = [];

    let totalProcessed = 0;
    let totalErrors = 0;
    const errorDetails: Array<{ rowIndex: number; error: string; data?: any }> = [];

    try {
      // Validate Excel file first
      console.log("Validating Excel file...");
      this.validateExcelFile(filePath);
      console.log("File validation passed");

      // Read Excel file
      console.log("Reading Excel file...");
      const { worksheet, totalRows } = this.readExcelFile(filePath);
      console.log(`Total rows detected: ${totalRows}`);

      // Handle empty file
      if (totalRows === 0) {
        console.warn("Warning: Excel file is empty, nothing to process");
        const processingTime = Date.now() - this.startTime;
        return {
          totalProcessed: 0,
          totalErrors: 0,
          errorDetails: [],
          processingTime,
          memoryUsage: this.calculateMemoryStats(),
        };
      }

      // Validate headers
      this.validateHeaders(worksheet, options);
      console.log("Headers validated successfully");

      // Create streaming processor
      const batchStream = this.createBatchStream<T>(worksheet, options, totalRows, batchProcessor);

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
      console.error("Error processing Excel file:", error);
      throw error;
    }
  }

  /**
   * Debug Excel file information
   */
  debugExcelFile(filePath: string): void {
    try {
      console.log("🔍 Excel File Debug Information:");
      console.log(`📁 File Path: ${filePath}`);

      const stats = require("fs").statSync(filePath);
      console.log(`📊 File Size: ${(stats.size / (1024 * 1024)).toFixed(2)}MB`);

      const workbook = XLSX.readFile(filePath, { sheetStubs: false });
      console.log(`📋 Total Sheets: ${workbook.SheetNames.length}`);

      workbook.SheetNames.forEach((sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName];
        const ref = worksheet["!ref"];

        console.log(`📄 Sheet ${index + 1}: "${sheetName}"`);
        if (ref) {
          const range = XLSX.utils.decode_range(ref);
          const totalRows = range.e.r - range.s.r + 1;
          const totalCols = range.e.c - range.s.c + 1;
          console.log(`   📐 Range: ${ref} (${totalRows} rows × ${totalCols} cols)`);
        } else {
          console.log(`   ⚠️  Empty sheet or no data`);
        }
      });
    } catch (error: any) {
      console.error("❌ Debug failed:", error.message);
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

export default SimpleExcelProcessor;
