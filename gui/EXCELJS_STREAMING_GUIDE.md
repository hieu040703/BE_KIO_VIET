# ExcelJS Streaming Utils - Hướng dẫn sử dụng

## Tổng quan

File này cung cấp các utility để stream và xử lý file Excel lớn bằng ExcelJS với hiệu suất cao và tiết kiệm memory.

## Tính năng chính

### 1. **Memory-Efficient Streaming**

- Xử lý file Excel theo batch để tiết kiệm memory
- Giám sát memory usage trong quá trình xử lý
- Tự động garbage collection khi cần thiết
- Giới hạn memory usage tối đa có thể cấu hình

### 2. **Flexible Processing**

- Hỗ trợ validation từng row
- Transform data trước khi xử lý
- Progress tracking và error handling
- Batch processing hoặc streaming từng row

### 3. **Robust Error Handling**

- Chi tiết lỗi với thông tin row và column
- Callback functions cho error handling
- Tiếp tục xử lý khi gặp lỗi (configurable)

## So sánh với XLSX

| Feature               | XLSX (hiện tại)  | ExcelJS                          |
| --------------------- | ---------------- | -------------------------------- |
| **Memory Usage**      | Thấp hơn         | Cao hơn nhưng có nhiều tính năng |
| **Performance**       | Nhanh hơn        | Chậm hơn nhưng ổn định           |
| **Feature Set**       | Cơ bản           | Đầy đủ (styling, formulas, etc.) |
| **Cell Types**        | Hạn chế          | Đầy đủ (Date, Formula, RichText) |
| **File Size Support** | Tốt cho file lớn | Tốt cho file trung bình/lớn      |
| **API Complexity**    | Đơn giản         | Phức tạp hơn nhưng mạnh mẽ       |

## Cách sử dụng

### 1. Import các class cần thiết

```typescript
import { ExcelJSStreamProcessor, IExcelJSStreamingOptions } from "./exceljs-streaming.utils";
import { IHeader } from "../common/excel/config";
```

### 2. Định nghĩa headers mapping

```typescript
const headerData: IHeader[] = [
  { key: "id", header: "Employee ID", width: 15 },
  { key: "name", header: "Full Name", width: 25 },
  { key: "email", header: "Email Address", width: 30 },
  { key: "department", header: "Department", width: 20 },
];
```

### 3. Cấu hình streaming options

```typescript
const options: IExcelJSStreamingOptions = {
  headerData,
  startRow: 2, // Bắt đầu từ row 2 (sau header)
  startCol: 1, // Bắt đầu từ column A
  batchSize: 1000, // Xử lý 1000 rows mỗi batch
  worksheetName: "Sheet1", // Hoặc worksheetIndex: 0
  maxMemoryUsage: 512, // Giới hạn 512MB

  // Validation function
  validateRow: (row, rowIndex) => {
    const errors = [];
    if (!row.id) errors.push("ID is required");
    if (!row.email?.includes("@")) errors.push("Invalid email");
    return { isValid: errors.length === 0, errors };
  },

  // Transform function
  transformRow: (row, rowIndex) => ({
    id: String(row.id).trim(),
    name: String(row.name).trim(),
    email: String(row.email).toLowerCase(),
    department: String(row.department || "").trim(),
  }),

  // Progress callback
  onProgress: (progress) => {
    console.log(`Progress: ${progress.percentage.toFixed(2)}%`);
  },

  // Error callback
  onError: (error, rowIndex, row) => {
    console.error(`Error at row ${rowIndex}:`, error.message);
  },
};
```

### 4. Xử lý file Excel

#### Phương pháp 1: Batch Processing (Khuyến nghị cho file lớn)

```typescript
const processor = new ExcelJSStreamProcessor();

// Batch processor function
const batchProcessor = async (batch: any[]) => {
  console.log(`Processing batch of ${batch.length} items...`);

  // Xử lý batch - ví dụ: lưu vào database
  await saveBatchToDatabase(batch);

  // Hoặc gửi lên API
  await sendBatchToAPI(batch);
};

// Xử lý file
const result = await processor.processExcelFile("/path/to/file.xlsx", options, batchProcessor);

console.log(`Processed: ${result.totalProcessed}, Errors: ${result.totalErrors}`);
```

#### Phương pháp 2: Row-by-Row Iterator

```typescript
// Stream từng row
for await (const rowData of processor.streamWorksheetRows(filePath, options)) {
  if (rowData) {
    console.log("Processing row:", rowData);
    await processIndividualRow(rowData);
  }
}
```

## Các tính năng nâng cao

### 1. Memory Management

```typescript
const options: IExcelJSStreamingOptions = {
  // ... other options
  maxMemoryUsage: 1024, // Giới hạn 1GB
  batchSize: 500, // Giảm batch size nếu memory thấp
};
```

### 2. Error Recovery

```typescript
const options: IExcelJSStreamingOptions = {
  // ... other options

  onError: (error, rowIndex, row) => {
    // Log error để debug
    console.warn(`Row ${rowIndex} error: ${error.message}`);

    // Ghi vào error log file
    fs.appendFileSync("error.log", `${rowIndex}: ${error.message}\n`);

    // Hoặc gửi notification
    await notifyErrorToSlack(error, rowIndex);
  },
};
```

### 3. Progress Tracking

```typescript
const options: IExcelJSStreamingOptions = {
  // ... other options

  onProgress: (progress) => {
    // Update progress bar
    updateProgressBar(progress.percentage);

    // Log milestone
    if (progress.processed % 10000 === 0) {
      console.log(`Milestone: ${progress.processed.toLocaleString()} processed`);
    }

    // Estimate remaining time
    const timePerRow = Date.now() / progress.processed;
    const remainingRows = progress.total - progress.processed;
    const estimatedTime = remainingRows * timePerRow;
    console.log(`ETA: ${Math.round(estimatedTime / 1000)}s`);
  },
};
```

### 4. Cell Type Handling

ExcelJS hỗ trợ nhiều loại cell khác nhau:

```typescript
transformRow: (row, rowIndex) => {
  return {
    // String cells
    name: String(row.name || "").trim(),

    // Number cells
    amount: Number(row.amount) || 0,

    // Date cells (ExcelJS tự động convert)
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(),

    // Boolean cells
    isActive: Boolean(row.isActive),

    // Formula cells (đã được tính toán)
    calculatedValue: row.calculatedValue,

    // Rich text cells
    description:
      typeof row.description === "object"
        ? row.description.richText?.map((rt) => rt.text).join("")
        : String(row.description),
  };
};
```

## Performance Tips

### 1. **Batch Size Optimization**

- File nhỏ (< 10K rows): batch size 100-500
- File trung bình (10K-100K rows): batch size 500-1000
- File lớn (> 100K rows): batch size 1000-2000

### 2. **Memory Management**

- Giới hạn memory usage phù hợp với server
- Sử dụng `global.gc()` nếu có flag `--expose-gc`
- Monitor memory usage trong quá trình xử lý

### 3. **Validation Performance**

- Validation đơn giản và nhanh
- Tránh async operations trong validation
- Cache regex patterns và lookup tables

### 4. **Database Operations**

- Sử dụng bulk insert thay vì insert từng row
- Batch database operations
- Sử dụng transactions cho consistency

## Ví dụ thực tế

Xem file `exceljs-streaming-examples.ts` để có các ví dụ chi tiết về:

1. **Employee Import**: Import danh sách nhân viên với validation
2. **Product Catalog**: Xử lý catalog sản phẩm lớn
3. **Transaction Processing**: Xử lý transaction logs với high throughput

## Error Codes và Troubleshooting

### Common Errors

1. **"Worksheet not found"**

   - Kiểm tra tên worksheet hoặc index
   - Sử dụng `worksheetIndex: 0` cho sheet đầu tiên

2. **"Header mismatch"**

   - So sánh header trong Excel với template
   - Kiểm tra encoding và special characters

3. **"Memory usage exceeded"**

   - Giảm batch size
   - Tăng memory limit
   - Optimize data processing

4. **"Cell value conversion error"**
   - Kiểm tra data types trong Excel
   - Thêm null checks trong transform function

## Migration từ XLSX

Nếu bạn đang dùng XLSX và muốn chuyển sang ExcelJS:

```typescript
// Trước đây (XLSX)
const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = XLSX.utils.sheet_to_json(worksheet);

// Bây giờ (ExcelJS với streaming)
const processor = new ExcelJSStreamProcessor();
await processor.processExcelFile(filePath, options, batchProcessor);
```

Lưu ý: ExcelJS có thể chậm hơn XLSX nhưng cung cấp nhiều tính năng hơn và xử lý cell types tốt hơn.
