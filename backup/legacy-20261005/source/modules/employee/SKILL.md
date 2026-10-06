# Employee module

- Entity `Employee.position` dùng `PositionDefaultEnum | null`; mọi thay đổi contract phải propagate qua model, validator, query types và FE form/select.
- FE form thêm/sửa nhân viên lấy danh sách chức vụ trực tiếp từ `PositionDefaultEnum`, không dùng `AttributeSelect` cho field này.
- `EmployeeSelect` và `EmployeeMultipleSelect` vẫn hỗ trợ filter `position` để chọn manager/recruiter theo chức vụ.
- Sau khi đổi enum BE, cần sync FE enum tương ứng (`FE/src/constants/enum.ts` và generated enums nếu workflow đang dùng).
- `Employee.expertise` là mảng `string[]` lưu ở cột PostgreSQL `text[]`; contract này phải được propagate qua model, migration, validator, select và FE form.
- FE form dùng `AttributeTypeEnum.EMPLOYEE_EXPERTISE` cho multi-select chuyên môn; quick-add lưu tên chuyên môn vào Attribute và Employee, còn `position` chỉ bắt buộc ở FE trong khi BE vẫn nullable.
- `GET /employees` bổ sung `estimatedAvailableHours`: truy vấn batch các `OrderEmployee` đang thuộc Order `PROCESSING` có `estimatedCompletionAt`, lấy mốc hoàn thành lớn nhất theo nhân viên và trả số giờ còn lại làm tròn 2 chữ số; không có dữ liệu hợp lệ trả `null`.
- Khi hoàn thành hợp đồng, cập nhật `Employee.isWorking` bằng `updateEmployeeStatuses()` theo tập `employeeId`; không gọi `updateEmployeeStatus()` theo vòng lặp để tránh N+1 query trên transaction. Contract một query cho 100 nhân viên được khóa trong `tests/order.complete.spec.ts`.
- Job `JobEmployeeCollaboratorInactivity` chạy lúc 01:00 theo timezone `Asia/Ho_Chi_Minh`, lấy hợp đồng đã phát sinh `startTime` mới nhất trước hiện tại để kiểm tra 5 ngày không hoạt động; nếu chưa có hợp đồng thì fallback sang `employee.startDate`, `null` sẽ chuyển ngay cộng tác viên `active` sang `inactive`. Cập nhật `note` bằng nội dung tự động nghỉ việc và dùng một lệnh SQL hàng loạt.
- Khi triển khai `PositionDefaultEnum.COLLABORATORS`, chạy migration `1778650000000-AddCollaboratorsToEmployeePositionEnum` trước khi tạo/cập nhật nhân viên cộng tác viên.
- Bộ lọc `position` của `GET /employees` phải dùng so sánh bằng (`entity.position = :position`) vì `Employee.position` là PostgreSQL enum; không dùng `ILIKE` trực tiếp trên cột này.
- Create/update Employee phải gọi `CommonService.validateUniquePhone()` để số điện thoại không trùng Employee hoặc Customer; bỏ qua khi phone null/rỗng.
