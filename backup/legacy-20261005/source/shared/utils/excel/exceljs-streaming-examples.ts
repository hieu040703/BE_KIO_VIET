import { IHeader } from "@/shared/config/excels";
import { ExcelJSStreamProcessor, IExcelJSStreamingOptions } from "./exceljs-streaming.utils";

/**
 * Ví dụ sử dụng ExcelJS để stream file Excel
 */

// Interface cho dữ liệu từ Excel
interface IEmployeeData {
  id: string;
  name: string;
  email: string;
  department: string;
  salary: number;
  joinDate: Date;
}

export class ExcelJSStreamingExample {
  private processor = new ExcelJSStreamProcessor();

  /**
   * Ví dụ 1: Stream và xử lý từng batch
   */
  async example1_StreamWithBatchProcessing() {
    console.log("=== Example 1: Stream with Batch Processing ===");

    // Define headers mapping
    const headerData: IHeader[] = [
      { key: "id", header: "Employee ID", width: 15 },
      { key: "name", header: "Full Name", width: 25 },
      { key: "email", header: "Email Address", width: 30 },
      { key: "department", header: "Department", width: 20 },
      { key: "salary", header: "Monthly Salary", width: 15 },
      { key: "joinDate", header: "Join Date", width: 15 },
    ];

    // Streaming options
    const options: IExcelJSStreamingOptions = {
      headerData,
      startRow: 2, // Bắt đầu từ row 2 (sau header)
      startCol: 1, // Bắt đầu từ column A
      batchSize: 100, // Xử lý 100 rows mỗi batch
      worksheetName: "Employees", // Hoặc dùng worksheetIndex: 0
      maxMemoryUsage: 512, // Giới hạn 512MB

      // Validate từng row
      validateRow: (row: any, rowIndex: number) => {
        const errors: string[] = [];

        if (!row.id || String(row.id).trim() === "") {
          errors.push("Employee ID is required");
        }

        if (!row.name || String(row.name).trim() === "") {
          errors.push("Full Name is required");
        }

        if (row.email && !this.isValidEmail(String(row.email))) {
          errors.push("Invalid email format");
        }

        if (row.salary && (isNaN(Number(row.salary)) || Number(row.salary) < 0)) {
          errors.push("Salary must be a positive number");
        }

        return {
          isValid: errors.length === 0,
          errors: errors.length > 0 ? errors : undefined,
        };
      },

      // Transform từng row
      transformRow: (row: any, rowIndex: number) => {
        return {
          id: String(row.id || "").trim(),
          name: String(row.name || "").trim(),
          email: String(row.email || "")
            .trim()
            .toLowerCase(),
          department: String(row.department || "").trim(),
          salary: row.salary ? Number(row.salary) : 0,
          joinDate: row.joinDate instanceof Date ? row.joinDate : null,
          rowIndex, // Thêm thông tin row index
        };
      },

      // Progress callback
      onProgress: (progress) => {
        console.log(`Progress: ${progress.processed}/${progress.total} (${progress.percentage.toFixed(2)}%)`);
      },

      // Error callback
      onError: (error, rowIndex, row) => {
        console.error(`Error at row ${rowIndex}:`, error.message);
      },
    };

    // Batch processor function
    const batchProcessor = async (batch: IEmployeeData[]) => {
      console.log(`Processing batch of ${batch.length} employees...`);

      // Ví dụ: Lưu vào database
      // await this.saveEmployeesToDatabase(batch);

      // Hoặc xử lý khác
      for (const employee of batch) {
        console.log(`Processing employee: ${employee.name} (${employee.email})`);
      }

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 100));
    };

    try {
      const filePath = "/path/to/your/employees.xlsx";

      const result = await this.processor.processExcelFile<IEmployeeData>(filePath, options, batchProcessor);

      console.log("Processing Results:");
      console.log(`- Total Processed: ${result.totalProcessed}`);
      console.log(`- Total Errors: ${result.totalErrors}`);
      console.log(`- Processing Time: ${result.processingTime}ms`);
      console.log(
        `- Memory Usage: Peak ${result.memoryUsage.peak.toFixed(2)}MB, Final ${result.memoryUsage.final.toFixed(2)}MB`
      );

      if (result.errorDetails.length > 0) {
        console.log("Error Details:");
        result.errorDetails.forEach((error) => {
          console.log(`  Row ${error.rowIndex}: ${error.error}`);
        });
      }
    } catch (error: any) {
      console.error("Processing failed:", error.message);
    }
  }

  /**
   * Ví dụ 2: Stream với Iterator (Alternative approach)
   */
  async example2_StreamWithIterator() {
    console.log("\n=== Example 2: Stream with Iterator ===");

    const headerData: IHeader[] = [
      { key: "id", header: "Product ID", width: 15 },
      { key: "name", header: "Product Name", width: 25 },
      { key: "price", header: "Unit Price", width: 15 },
      { key: "category", header: "Category", width: 20 },
    ];

    const options: IExcelJSStreamingOptions = {
      headerData,
      startRow: 2,
      startCol: 1,
      worksheetIndex: 0, // First worksheet

      validateRow: (row: any, rowIndex: number) => {
        const errors: string[] = [];

        if (!row.id) errors.push("Product ID required");
        if (!row.name) errors.push("Product Name required");
        if (!row.price || isNaN(Number(row.price))) errors.push("Valid price required");

        return { isValid: errors.length === 0, errors };
      },

      transformRow: (row: any, rowIndex: number) => ({
        id: String(row.id).trim(),
        name: String(row.name).trim(),
        price: Number(row.price),
        category: String(row.category || "").trim(),
      }),

      onError: (error, rowIndex, row) => {
        console.warn(`Warning at row ${rowIndex}: ${error.message}`);
      },
    };

    try {
      const filePath = "/path/to/your/products.xlsx";
      let processedCount = 0;

      // Stream rows one by one
      for await (const rowData of this.processor.streamWorksheetRows(filePath, options)) {
        if (rowData) {
          console.log(`Processing product: ${rowData.name} - $${rowData.price}`);
          processedCount++;

          // Process individual row
          // await this.processProduct(rowData);

          // Periodically report progress
          if (processedCount % 100 === 0) {
            console.log(`Processed ${processedCount} products so far...`);
          }
        }
      }

      console.log(`Total processed: ${processedCount} products`);
    } catch (error: any) {
      console.error("Iterator processing failed:", error.message);
    }
  }

  /**
   * Ví dụ 3: Xử lý file lớn với memory-efficient approach
   */
  async example3_LargeFileProcessing() {
    console.log("\n=== Example 3: Large File Processing ===");

    const headerData: IHeader[] = [
      { key: "transactionId", header: "Transaction ID", width: 20 },
      { key: "userId", header: "User ID", width: 15 },
      { key: "amount", header: "Amount", width: 15 },
      { key: "currency", header: "Currency", width: 10 },
      { key: "timestamp", header: "Timestamp", width: 20 },
      { key: "status", header: "Status", width: 15 },
    ];

    const options: IExcelJSStreamingOptions = {
      headerData,
      startRow: 2,
      startCol: 1,
      batchSize: 1000, // Larger batch size for better performance
      worksheetIndex: 0,
      maxMemoryUsage: 1024, // 1GB limit

      validateRow: (row: any, rowIndex: number) => {
        const errors: string[] = [];

        if (!row.transactionId) errors.push("Transaction ID required");
        if (!row.userId) errors.push("User ID required");
        if (!row.amount || isNaN(Number(row.amount))) errors.push("Valid amount required");
        if (!row.currency) errors.push("Currency required");

        return { isValid: errors.length === 0, errors };
      },

      transformRow: (row: any, rowIndex: number) => ({
        transactionId: String(row.transactionId).trim(),
        userId: String(row.userId).trim(),
        amount: Number(row.amount),
        currency: String(row.currency).trim().toUpperCase(),
        timestamp: row.timestamp instanceof Date ? row.timestamp : new Date(),
        status: String(row.status || "PENDING")
          .trim()
          .toUpperCase(),
      }),

      onProgress: (progress) => {
        if (progress.processed % 10000 === 0) {
          console.log(
            `Large file progress: ${progress.processed.toLocaleString()}/${progress.total.toLocaleString()} (${progress.percentage.toFixed(
              2
            )}%)`
          );
        }
      },

      onError: (error, rowIndex, row) => {
        console.warn(`Transaction error at row ${rowIndex}: ${error.message}`);
      },
    };

    // Batch processor với database operations
    const batchProcessor = async (batch: any[]) => {
      console.log(`Processing transaction batch of ${batch.length} items...`);

      try {
        // Bulk insert to database
        // await this.bulkInsertTransactions(batch);

        // Or send to message queue
        // await this.sendToQueue(batch);

        console.log(`✅ Successfully processed batch of ${batch.length} transactions`);
      } catch (error: any) {
        console.error(`❌ Failed to process batch: ${error.message}`);
        throw error; // Re-throw to handle in main processor
      }
    };

    try {
      const filePath = "/path/to/your/large-transactions.xlsx";

      const startTime = Date.now();
      const result = await this.processor.processExcelFile(filePath, options, batchProcessor);
      const endTime = Date.now();

      console.log("\n📊 Large File Processing Results:");
      console.log(`⏱️  Total Time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
      console.log(`📝 Total Processed: ${result.totalProcessed.toLocaleString()}`);
      console.log(`❌ Total Errors: ${result.totalErrors.toLocaleString()}`);
      console.log(`💾 Peak Memory: ${result.memoryUsage.peak.toFixed(2)}MB`);
      console.log(`⚡ Throughput: ${(result.totalProcessed / (result.processingTime / 1000)).toFixed(0)} rows/second`);
    } catch (error: any) {
      console.error("Large file processing failed:", error.message);
    }
  }

  /**
   * Helper method để validate email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log("🚀 Starting ExcelJS Streaming Examples...\n");

    try {
      await this.example1_StreamWithBatchProcessing();
      await this.example2_StreamWithIterator();
      await this.example3_LargeFileProcessing();

      console.log("\n✅ All examples completed successfully!");
    } catch (error: any) {
      console.error("\n❌ Examples failed:", error.message);
    }
  }
}

// Export for use
export default ExcelJSStreamingExample;

// Usage example:
// const example = new ExcelJSStreamingExample();
// await example.runAllExamples();
