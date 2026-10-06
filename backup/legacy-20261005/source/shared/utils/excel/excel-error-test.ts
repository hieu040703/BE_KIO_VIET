import { IHeader } from "../../config/excels";
import SimpleExcelProcessor from "./simple-excel.utils";
import { ISimpleStreamingOptions } from "./simple-excel.utils";

/**
 * Test error handling for Excel processing
 */
export class ExcelErrorHandlingTest {
  private processor = new SimpleExcelProcessor();

  /**
   * Test various error scenarios
   */
  async testErrorScenarios() {
    console.log("🧪 Testing Excel Error Handling Scenarios...\n");

    // Test 1: File not found
    await this.testFileNotFound();

    // Test 2: Invalid file format
    await this.testInvalidFileFormat();

    // Test 3: Empty worksheet
    await this.testEmptyWorksheet();

    // Test 4: Debug file information
    await this.testDebugFileInfo();
  }

  /**
   * Test 1: File not found
   */
  async testFileNotFound() {
    console.log("📝 Test 1: File Not Found");

    const headerData: IHeader[] = [{ key: "name", header: "Name", width: 20, children: [] }];

    const options: ISimpleStreamingOptions = {
      headerData,
      startRow: 2,
      startCol: 1,
      batchSize: 100,
    };

    try {
      await this.processor.processExcelFile("/nonexistent/file.xlsx", options, async (batch) => {
        console.log("Processing batch:", batch.length);
      });
      console.log("❌ Test failed - should have thrown error");
    } catch (error: any) {
      console.log("✅ Expected error caught:", error.message);
    }
    console.log("");
  }

  /**
   * Test 2: Invalid file format
   */
  async testInvalidFileFormat() {
    console.log("📝 Test 2: Invalid File Format");

    const headerData: IHeader[] = [{ key: "name", header: "Name", width: 20, children: [] }];

    const options: ISimpleStreamingOptions = {
      headerData,
      startRow: 2,
      startCol: 1,
      batchSize: 100,
    };

    try {
      // Assuming you have a text file for testing
      await this.processor.processExcelFile(
        "./package.json", // JSON file instead of Excel
        options,
        async (batch) => {
          console.log("Processing batch:", batch.length);
        }
      );
      console.log("❌ Test failed - should have thrown error");
    } catch (error: any) {
      console.log("✅ Expected error caught:", error.message);
    }
    console.log("");
  }

  /**
   * Test 3: Empty worksheet
   */
  async testEmptyWorksheet() {
    console.log("📝 Test 3: Empty Worksheet Handling");

    // This test requires you to have an empty Excel file
    // You can create one manually for testing

    const headerData: IHeader[] = [
      { key: "id", header: "ID", width: 10, children: [] },
      { key: "name", header: "Name", width: 20, children: [] },
    ];

    const options: ISimpleStreamingOptions = {
      headerData,
      startRow: 2,
      startCol: 1,
      batchSize: 100,

      onProgress: (progress) => {
        console.log(`   Progress: ${progress.processed}/${progress.total}`);
      },

      onError: (error, rowIndex, row) => {
        console.log(`   Error at row ${rowIndex}: ${error.message}`);
      },
    };

    try {
      // You would need to create an empty Excel file for this test
      const emptyFilePath = "./empty-test.xlsx";

      const result = await this.processor.processExcelFile(emptyFilePath, options, async (batch) => {
        console.log("   Processing batch:", batch.length);
      });

      console.log("✅ Empty file handled successfully:");
      console.log(`   Total processed: ${result.totalProcessed}`);
      console.log(`   Total errors: ${result.totalErrors}`);
    } catch (error: any) {
      console.log("ℹ️  Empty file test skipped (file not found):", error.message);
    }
    console.log("");
  }

  /**
   * Test 4: Debug file information
   */
  async testDebugFileInfo() {
    console.log("📝 Test 4: Debug File Information");

    try {
      // Test with package.json (will fail but show debug info)
      this.processor.debugExcelFile("./package.json");
    } catch (error: any) {
      console.log("   Debug test completed (expected to fail)");
    }

    console.log("");
  }

  /**
   * Test with a real Excel file (if available)
   */
  async testRealExcelFile(filePath: string) {
    console.log(`📝 Testing Real Excel File: ${filePath}`);

    // First, debug the file
    console.log("🔍 Debugging file structure:");
    this.processor.debugExcelFile(filePath);

    const headerData: IHeader[] = [
      { key: "col1", header: "Column 1", width: 15, children: [] },
      { key: "col2", header: "Column 2", width: 15, children: [] },
      { key: "col3", header: "Column 3", width: 15, children: [] },
    ];

    const options: ISimpleStreamingOptions = {
      headerData,
      startRow: 2,
      startCol: 1,
      batchSize: 10,

      validateRow: (row, rowIndex) => {
        // Simple validation
        const errors: string[] = [];
        if (!row.col1 && !row.col2 && !row.col3) {
          errors.push("Row appears to be empty");
        }
        return { isValid: errors.length === 0, errors };
      },

      transformRow: (row, rowIndex) => ({
        col1: String(row.col1 || "").trim(),
        col2: String(row.col2 || "").trim(),
        col3: String(row.col3 || "").trim(),
        rowIndex,
      }),

      onProgress: (progress) => {
        console.log(`   📊 Progress: ${progress.processed}/${progress.total} (${progress.percentage.toFixed(1)}%)`);
      },

      onError: (error, rowIndex, row) => {
        console.log(`   ⚠️  Error at row ${rowIndex}: ${error.message}`);
      },
    };

    try {
      const result = await this.processor.processExcelFile(filePath, options, async (batch) => {
        console.log(`   🔄 Processing batch of ${batch.length} items`);
        // Just log first item of each batch
        if (batch.length > 0) {
          console.log(`      First item:`, batch[0]);
        }
      });

      console.log("✅ Processing completed:");
      console.log(`   📈 Total processed: ${result.totalProcessed}`);
      console.log(`   ❌ Total errors: ${result.totalErrors}`);
      console.log(`   ⏱️  Processing time: ${result.processingTime}ms`);
      console.log(`   💾 Memory usage: ${result.memoryUsage.peak.toFixed(2)}MB peak`);

      if (result.errorDetails.length > 0) {
        console.log("   📋 Error details:");
        result.errorDetails.slice(0, 5).forEach((error, index) => {
          console.log(`      ${index + 1}. Row ${error.rowIndex}: ${error.error}`);
        });
        if (result.errorDetails.length > 5) {
          console.log(`      ... and ${result.errorDetails.length - 5} more errors`);
        }
      }
    } catch (error: any) {
      console.log("❌ Real file test failed:", error.message);
      console.log("   Stack:", error.stack);
    }

    console.log("");
  }
}

// Usage example:
// const tester = new ExcelErrorHandlingTest();
// await tester.testErrorScenarios();
// await tester.testRealExcelFile("/path/to/your/excel/file.xlsx");

export default ExcelErrorHandlingTest;
