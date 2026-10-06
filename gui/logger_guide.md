# Hướng dẫn sử dụng Logger trong dự án

File này cung cấp hướng dẫn về cách sử dụng module `logger.ts` trong dự án `BE_BOC_XEP_HANG_HOA`.

## 0. Cài đặt thư viện

Trước khi sử dụng logger, bạn cần cài đặt thư viện `@datalust/winston-seq` để tích hợp với Seq.

Chạy lệnh sau trong terminal của dự án:

```bash
npm install @datalust/winston-seq
```

## 1. Import Logger

Bạn có thể import logger bằng cách sử dụng đường dẫn sau:

```typescript
import logger from "./logger";
```

## 2. Các cấp độ Log (Log Levels)

Logger hỗ trợ các cấp độ log tiêu chuẩn của Winston, giúp bạn phân loại mức độ nghiêm trọng của thông báo:

- **`logger.error(message, metadata)`**: Dùng cho các lỗi nghiêm trọng (ví dụ: lỗi kết nối database, lỗi xử lý request). Các log này sẽ được ghi vào `error.log`.
- **`logger.warn(message, metadata)`**: Dùng cho các cảnh báo (ví dụ: một API endpoint không được sử dụng, dữ liệu đầu vào không hợp lệ nhưng vẫn có thể xử lý).
- **`logger.info(message, metadata)`**: Dùng cho các thông báo thông thường về tiến trình ứng dụng (ví dụ: "Server đã khởi động thành công", "User X đã đăng nhập").
- **`logger.debug(message, metadata)`**: Dùng cho các thông tin chi tiết về quá trình hoạt động của ứng dụng, thường chỉ bật trong môi trường phát triển (`development`).

## 3. Cách sử dụng

### Ví dụ 1: Log thông tin cơ bản

```typescript
import logger from "./logger";

// Log một thông báo thông thường
logger.info("Ứng dụng đã bắt đầu hoạt động.");
```

### Ví dụ 2: Log lỗi với Metadata

Bạn có thể truyền một đối tượng `metadata` để ghi lại các thông tin bổ sung (ví dụ: ID người dùng, tên endpoint, mã lỗi).

```typescript
import logger from "./logger";

try {
  // ... code có thể gây lỗi
} catch (error) {
  // Ghi lại lỗi và kèm theo thông tin chi tiết
  logger.error("Lỗi khi xử lý yêu cầu API", {
    endpoint: "/api/products",
    userId: 123,
    stack: error.stack,
  });
}
```

## 4. Lưu ý quan trọng

- **Môi trường Production**: Trong môi trường production, logger sẽ chỉ ghi vào file (`error.log`, `combined.log`) và Seq (nếu cấu hình), không in ra console.
- **Metadata**: Luôn sử dụng metadata khi log các sự kiện quan trọng để dễ dàng lọc và tìm kiếm trong các hệ thống log tập trung (như Seq).
