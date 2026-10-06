# Zalo module notes

- `ZaloRouter` phục vụ các API tích hợp Zalo OA dưới prefix `/zalo`.
- `AdminZaloTemplateRouter` được mount ở `/zalo-templates`; FE dùng CRUD cho cấu hình `name`, `type`, `templateId`, `note`.
- `AdminZaloMessageHistoryRouter` được mount ở `/zalo-message-histories`; FE dùng phân trang, lọc `phone`, `status`, `templateType`, khoảng `startAt`/`endAt`, gửi lại và xóa lịch sử.
- Hai admin router được bind trong `src/modules/container.ts` và phải được lấy từ DI rồi mount trong `src/routers/admin.routes.ts`.
- `ZaloService.sendMessage()` luôn persist `ZaloMessageHistory` với trạng thái `SENT` hoặc `FAILED` trong cả hai nhánh kết quả; lần gửi mới tạo bản ghi, còn resend cập nhật bản ghi cũ.
- Luồng gửi Zalo của Order truyền `orderId` và `customerId` qua `ZaloMessageHistoryContext`; việc ghi lịch sử diễn ra sau commit Order nên lỗi Zalo không rollback đơn hàng.
- `ZaloMessageHistoryService.resend()` truyền `historyId`; retry cập nhật bản ghi cũ bằng `repository.update()` và không tạo thêm lịch sử.
- `ZaloService.sendMessage()` ánh xạ mã lỗi ZBS theo cột "Thông tin lỗi" trong tài liệu Zalo sang tiếng Việt khi lưu `errorMessage`; vẫn giữ `errorCode`, log và exception gốc, còn mã chưa có trong bảng dùng thông báo gốc làm fallback.
- `ZaloMessageHistory.order` dùng `ON DELETE CASCADE`; migration `1779200000000` thay thế FK cũ trên `orderId` để xóa đơn hàng không bị chặn bởi lịch sử gửi Zalo.
