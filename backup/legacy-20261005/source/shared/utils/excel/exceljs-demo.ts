import * as path from "path";
import ExcelJSStreamProcessor, { IExcelJSStreamingOptions } from "./exceljs-streaming.utils";
import { IHeader } from "@/shared/config/excels";

/**
 * Demo nhanh để test ExcelJS streaming
 */
export class QuickExcelJSDemo {
  private processor = new ExcelJSStreamProcessor();

  /**
   * Demo cơ bản - xử lý file Excel đơn giản
   */
  async basicDemo() {
    console.log("🚀 Starting Basic ExcelJS Streaming Demo...");

    // Định nghĩa headers (adjust theo file Excel của bạn)
    const headerData: IHeader[] = [
      { key: "name", header: "Name", width: 20, children: [] },
      { key: "email", header: "Email", width: 30, children: [] },
      { key: "phone", header: "Phone", width: 15, children: [] },
      { key: "city", header: "City", width: 15, children: [] },
    ];

    const options: IExcelJSStreamingOptions = {
      headerData,
      startRow: 2, // Bắt đầu từ row 2 (sau header)
      startCol: 1, // Bắt đầu từ column A
      batchSize: 10, // Batch nhỏ để demo
      worksheetIndex: 0, // Sheet đầu tiên

      // Validation đơn giản
      validateRow: (row: any, rowIndex: number) => {
        const errors: string[] = [];

        if (!row.name || String(row.name).trim() === "") {
          errors.push("Name is required");
        }

        if (row.email && !String(row.email).includes("@")) {
          errors.push("Invalid email format");
        }

        return {
          isValid: errors.length === 0,
          errors: errors.length > 0 ? errors : undefined,
        };
      },

      // Transform data
      transformRow: (row: any, rowIndex: number) => {
        return {
          name: String(row.name || "").trim(),
          email: String(row.email || "")
            .trim()
            .toLowerCase(),
          phone: String(row.phone || "").trim(),
          city: String(row.city || "").trim(),
          rowIndex, // Thêm row index để debug
        };
      },

      // Progress callback
      onProgress: (progress) => {
        console.log(`📊 Progress: ${progress.processed}/${progress.total} (${progress.percentage.toFixed(1)}%)`);
      },

      // Error callback
      onError: (error, rowIndex, row) => {
        console.error(`❌ Error at row ${rowIndex}: ${error.message}`);
      },
    };

    // Batch processor - xử lý từng batch data
    const batchProcessor = async (batch: any[]) => {
      console.log(`\n🔄 Processing batch of ${batch.length} items:`);

      for (const item of batch) {
        console.log(`  - ${item.name} (${item.email}) from ${item.city}`);
      }

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log(`✅ Batch processed successfully!`);
    };

    try {
      // Thay đổi đường dẫn file Excel của bạn ở đây
      const filePath = path.join(process.cwd(), "sample-data.xlsx");

      console.log(`📂 Processing file: ${filePath}`);

      const startTime = Date.now();
      const result = await this.processor.processExcelFile(filePath, options, batchProcessor);
      const endTime = Date.now();

      // Hiển thị kết quả
      console.log("\n📋 Processing Results:");
      console.log(`✅ Total Processed: ${result.totalProcessed}`);
      console.log(`❌ Total Errors: ${result.totalErrors}`);
      console.log(`⏱️  Processing Time: ${result.processingTime}ms`);
      console.log(`🕒 Total Time: ${endTime - startTime}ms`);
      console.log(`💾 Peak Memory: ${result.memoryUsage.peak.toFixed(2)}MB`);
      console.log(`💾 Final Memory: ${result.memoryUsage.final.toFixed(2)}MB`);

      if (result.errorDetails.length > 0) {
        console.log("\n🚨 Error Details:");
        result.errorDetails.forEach((error, index) => {
          console.log(`  ${index + 1}. Row ${error.rowIndex}: ${error.error}`);
        });
      }
    } catch (error: any) {
      console.error("\n💥 Demo failed:", error.message);
      console.error("Stack:", error.stack);
    }
  }

  /**
   * Demo với Iterator approach
   */
  async iteratorDemo() {
    console.log("\n🔄 Starting Iterator Demo...");

    const headerData: IHeader[] = [
      { key: "id", header: "ID", width: 10, children: [] },
      { key: "name", header: "Product Name", width: 25, children: [] },
      { key: "price", header: "Price", width: 15, children: [] },
    ];

    const options: IExcelJSStreamingOptions = {
      headerData,
      startRow: 2,
      startCol: 1,
      worksheetIndex: 0,

      validateRow: (row: any, rowIndex: number) => {
        const errors: string[] = [];
        if (!row.id) errors.push("ID required");
        if (!row.name) errors.push("Name required");
        if (row.price && isNaN(Number(row.price))) errors.push("Invalid price");
        return { isValid: errors.length === 0, errors };
      },

      transformRow: (row: any, rowIndex: number) => ({
        id: String(row.id).trim(),
        name: String(row.name).trim(),
        price: row.price ? Number(row.price) : 0,
      }),

      onError: (error, rowIndex, row) => {
        console.warn(`⚠️  Row ${rowIndex}: ${error.message}`);
      },
    };

    try {
      const filePath = path.join(process.cwd(), "products.xlsx");
      let count = 0;

      console.log(`📂 Streaming file: ${filePath}`);

      // Stream từng row
      for await (const rowData of this.processor.streamWorksheetRows(filePath, options)) {
        if (rowData) {
          count++;
          console.log(`${count}. ${rowData.name} - $${rowData.price}`);

          // Process individual row
          // await processProduct(rowData);

          // Break after 10 items for demo
          if (count >= 10) {
            console.log("... (stopped at 10 items for demo)");
            break;
          }
        }
      }

      console.log(`\n✅ Iterator demo completed. Processed ${count} items.`);
    } catch (error: any) {
      console.error("Iterator demo failed:", error.message);
    }
  }

  /**
   * Run all demos
   */
  async runAllDemos() {
    console.log("🎯 ExcelJS Streaming Demos");
    console.log("=".repeat(50));

    try {
      await this.basicDemo();
      await this.iteratorDemo();

      console.log("\n🎉 All demos completed!");
    } catch (error: any) {
      console.error("\n💥 Demo suite failed:", error.message);
    }
  }
}

// Để chạy demo:
// const demo = new QuickExcelJSDemo();
// await demo.runAllDemos();

export default QuickExcelJSDemo;
