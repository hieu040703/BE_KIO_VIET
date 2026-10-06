# Employee ticket module

- `employee_tickets` và `employee_ticket_replies` là bounded context riêng, không dùng chung entity customer ticket.
- Actor tạo/reply được lấy từ JWT và kiểm tra lại với User/Employee trong database; không tin `employeeId` hoặc `userId` từ payload.
- Ticket được broadcast tới ADMIN và tài khoản active có `employeeTicket.read`; không lưu recipient snapshot.
- Người có quyền đọc xem toàn bộ ticket; nhân viên không có quyền đọc chỉ xem ticket do chính mình tạo.
- Tất cả create/reply/status notification writes phải đi qua transaction manager.
- Contract tích hợp mobile nằm ở `employeeTicket.mobile-api.md`, gồm cookie auth hiện tại, enum, payload, response, quyền owner/read/update và notification deep-link.
- Participant ACL dùng bảng riêng `employee_ticket_participants`, soft-delete và unique active theo cặp ticket/user; owner không backfill vào bảng này.
- List/detail/reply phải dùng cùng policy: ADMIN hoặc MANAGER có `employeeTicket.read` xem toàn bộ; owner hoặc active participant chỉ xem ticket được phép.
- Không dùng `viewAll` từ JWT để bypass policy; quyền quản lý participant chỉ dành cho ADMIN và việc thêm nhiều user phải atomic, không tạo bản ghi trùng active.
- API participant gồm danh sách user đang tham gia, thêm nhiều user idempotent, xoá mềm từng user và danh sách candidate dành cho màn Admin Web.
- Mobile contract phải mô tả rõ owner/participant access, endpoint participant, event `PARTICIPANT_ADDED` và việc Admin Web mới được add/remove.
- Middleware nạp `permissionGroup` từ database vào request context sau khi xác thực; các service/repository không được suy luận quyền MANAGER chỉ từ JWT role.
- Regression test phải bao phủ request context có `permissionGroup`, để tránh tình trạng middleware cho qua nhưng repository/service lại lọc như user không quyền.
- Khi khai báo fixture permission trong test, dùng kiểu của permission helper để giữ literal union và tránh test lệch contract TypeScript.
- Participant service phải re-check actor ADMIN active từ UserRepository trong transaction; middleware là lớp chặn route, không phải lớp bảo vệ duy nhất.
- Các thao tác add/remove phải chặn role không phải ADMIN trước khi mở transaction, rồi tiếp tục re-check account active trong transaction.
- Participant không có Employee active vẫn được mở detail/reply bằng membership active đã kiểm tra tại middleware; candidate chỉ gồm role được phép đi qua admin router.
- Khi đọc route params trong middleware, chuẩn hoá `id`/`ticketId` về một `string` trước khi truyền vào TypeORM để không nhận `string[]` từ Express params.
