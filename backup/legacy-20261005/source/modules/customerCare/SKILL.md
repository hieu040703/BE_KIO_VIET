# Customer care module notes

- Tên kỹ thuật là `customerCare` để không trùng với `CustomerService` của module
  customer. Public route là `/customer-services`; permission key là
  `customerService`.
- `GET /customer-services` bắt buộc có `customerId`, có phân trang và mặc định
  sắp xếp `scheduledAt DESC`.
- Phương thức: `CALL`, `EMAIL`, `ZALO`, `SMS`, `IN_PERSON`, `OTHER`.
- Trạng thái: `SCHEDULED`, `COMPLETED`, `CANCELED`.
- `COMPLETED` tự gán `completedAt` nếu thiếu; trạng thái khác luôn xóa
  `completedAt`.
- `nextFollowUpAt`, nếu có, phải sau `scheduledAt`.
- Customer và employee phải tồn tại. Xóa record dùng soft-delete; xóa customer
  sẽ cascade các record liên quan, còn xóa employee bị chặn để giữ lịch sử.
- Verify: `yarn jest src/modules/customerCare --runInBand` và `yarn build`.
