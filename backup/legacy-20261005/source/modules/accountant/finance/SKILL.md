# Finance module notes

- `Finance.category` là cột `text` lưu trực tiếp **tên (name)** của `Attribute` (type=`FINANCE`), không phải `attributeId`. FE chọn category qua `AttributeSelect` (`FE/src/components/select/AttributeSelect.tsx`) và lưu `attr.name` vào field `category`.
- Filter theo hạng mục (`categoryIds` trong `FinanceQuerySchema`) nhận mảng `Attribute.id`, nhưng phải map sang tên qua subquery `SELECT name FROM attributes WHERE id IN (...)` rồi so khớp với `entity.category` — xem `FinanceRepository.extendQueryBuilder`. Không so trực tiếp `categoryIds` với `entity.categoryId` vì cột đó không tồn tại.
- `categoryIds` chỉ nên bật ở tab "Thu chi" (`FinanceTypeEnum.INCOME`/`EXPENSE`, attribute type=FINANCE), không bật ở "Tạm ứng công việc" (attribute type=ADVANCE_EMPLOYEE) vì khác Attribute type — xem `FE/src/pages/Private/finance/index.tsx` (biến `filterUses`).
- Lookup Finance không truyền `type` phải bao gồm `INCOME`, `EXPENSE` và `SALARY`; `BaseRepository.findById()` vẫn chạy `extendQueryBuilder`, nên bỏ `SALARY` ở đây sẽ làm lỗi cập nhật/xóa phiếu lương.
- Danh sách Thu chi truyền `excludeSalary=true` để loại `SALARY` ngay tại repository; tab Lương truyền `type=SALARY`. Summary aggregate phải dùng cùng phạm vi type và các filter thời gian/chi nhánh/nhân viên để tổng không lệch danh sách.
- Sau update/delete phiếu thu có `orderId`, `CalculateOrderData.process()` chỉ cập nhật tổng tiền Order đồng bộ; Debt, Finance liên quan và OrderLeader được worker `orderCalculation` đồng bộ sau commit.
- Finance `SALARY` là khoản chi lương nhân viên, được tạo từ `TimeKeepingConfirm.totalRealSalary`, luôn sinh Transaction `OUT`, không tính vào debt và được cộng vào `totalExpense` cùng `EXPENSE`.
- Khi trả Finance cho các bảng tài chính, quan hệ `user.employee` phải lấy `zaloName` và `name` để hiển thị người lập phiếu theo đúng thứ tự ưu tiên.
- Approval trả riêng `salaries` và `expenses`; payload dùng `salaryIds` cho chi lương và `expenseIds` cho chi khác. Finance liên kết với `TimeKeepingConfirm` phải được cleanup trước khi xóa phiếu chấm công.
- Phiếu thu tạo thủ công có `customerId`, `orderId` hoặc `orderPayments` phải ở trạng thái `PENDING`; phiếu thu thủ công không liên quan và các nguồn tự động phải `APPROVED` ngay.
- Các nguồn nội bộ gọi `FinanceService.create()` truyền `FinanceCreationSourceEnum.SYSTEM` hoặc `BANK_WEBHOOK`; chỉ phiếu thu đã `APPROVED` mới sinh Transaction và cập nhật tổng Order.
