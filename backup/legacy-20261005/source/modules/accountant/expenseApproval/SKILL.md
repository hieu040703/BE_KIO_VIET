# Expense approval module notes

- `GET /get-data` nhận `direction=INCOME|EXPENSE`; phiếu thu chỉ trả các dòng `Finance` ở trạng thái `PENDING` có `customerId` hoặc `orderId`.
- Duyệt phiếu thu dùng `incomeIds`; server kiểm tra loại và trạng thái, sau đó mở rộng theo toàn bộ các dòng đang chờ duyệt có cùng mã phiếu.
- Phiếu thu và phiếu chi dùng riêng module quyền `financeIncomeConfirm` và `financeExpenseConfirm`; không tin vào quyền hoặc loại bản ghi do FE tự suy luận.
- Xóa `INCOME`, `EXPENSE` và `SALARY` trong danh sách approval phải đi qua `FinanceService.delete` để xử lý transaction và dữ liệu liên quan.
- Danh sách phê duyệt phiếu chi lấy thêm quan hệ `Finance.user.employee` cho các nhóm lương, chi khác và tạm ứng để FE ưu tiên hiển thị tên Zalo/tên nhân viên của người lập.
- Danh sách phê duyệt phiếu chi phải chọn thêm `Finance.createdAt` cho các nhóm tạm ứng để FE hiển thị ngày lập phiếu.
- Resolver quyền động phải được bọc bằng `permissionMiddleware(...)`; không gắn trực tiếp `approvalPermission(...)` vào route vì resolver không tự gọi `next()`.
