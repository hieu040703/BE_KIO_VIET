# Notification module notes

- `NotificationService.createNotificationForMultipleUsers` nhận `options.orderCode` để chuẩn hóa tiêu đề thành `[Order.code]: tiêu đề` trước khi lưu DB, gửi socket và gửi Firebase.
- Notification có `type = ALERT` được `NotificationService` thêm tiền tố `⚠️` đúng một lần trước khi lưu DB, gửi socket và gửi Firebase; caller đã có icon vẫn giữ nguyên.
- `FirebaseUtils` hỗ trợ `orderCode` cho các đường gửi tới user, token và topic; các caller có ngữ cảnh `Order` phải truyền mã từ entity đã load.
- Helper `BE/src/shared/utils/notification.utils.ts` có tính idempotent để tránh thêm tiền tố hai lần.
- Payload socket `notification` phải giữ các trường `id`, `metadata`, `objectId`, `timeAt`, `createdAt`, `updatedAt` và `isRead` để FE hiển thị thời gian, đánh dấu đã đọc và điều hướng tới đối tượng tương ứng; không gửi kèm `details` để tránh lộ danh sách người nhận.
- Không suy luận `orderCode` từ `objectId`, metadata hoặc dữ liệu client khi caller không có `Order` tương ứng.
