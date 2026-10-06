# Goong Map module

- `GET /goong-maps/processing-orders` là read model dành cho trang Map quản trị. Endpoint lọc `OrderStatusEnum.PROCESSING`, phân trang, áp dụng `order.read` và giới hạn dữ liệu theo `req.user`.
- Endpoint nhận thêm `orderId` tùy chọn để đọc read model của một đơn PROCESSING; FE Order dùng tham số này cho popup MAP theo từng đơn.
- Query map dùng ba batch: đơn cơ bản, toàn bộ `OrderEmployee` đang gán cho các đơn, và latest `OrderManagerLocation` theo cặp `orderId + employeeId`; không truy vấn vị trí theo từng nhân viên.
- FE lấy marker đơn từ `Order.address` và tạo một marker riêng cho từng `OrderEmployee` có `latestLocation`; card/popup của đơn và popup marker đều hiển thị danh sách nhân viên cùng vị trí mới nhất nếu có.
- `OrderLocationMap` được dùng chung cho bản đồ tổng trong module Map và bản đồ của từng hợp đồng, nên hai màn hình phải nhận cùng contract `ProcessingOrderMapItem.employees`.
- `goongMap.map.ts` là boundary transformer, chuẩn hóa địa chỉ/tọa độ và loại trùng nhân viên; giữ dữ liệu tọa độ dạng `{ latitude, longitude }` để FE tự chuyển sang thứ tự MapLibre.
- Read model map trả thêm `employees[].avatarUrl`, lấy từ file active trong bảng `files` theo `entityId = employeeId` và `category = avatar` (ưu tiên file chính, `thumbnailUrl`, sau đó `url`); giá trị không có avatar là `null` để FE giữ marker mặc định.
- Read model map trả thêm `employees[].checkInAt` và `employees[].checkOutAt` từ `OrderEmployee`, chuẩn hóa timestamp về ISO string; nhân viên chưa thực hiện thao tác tương ứng nhận giá trị `null`.
- Read model map trả thêm `employees[].phone` và `employees[].zaloName` từ bảng `employees`, để FE lọc danh sách nhân viên distinct theo tên, tên Zalo và số điện thoại.
- `JobOrderLocationTracking` lấy tất cả target từ `OrderEmployee` chưa bị soft-delete của các đơn `PROCESSING`, join bắt buộc `employee.user`, rồi emit một `ping_location` cho từng cặp đơn hàng + nhân viên có tài khoản. Không khử trùng nhân viên giữa các đơn vì mỗi đơn cần lưu vị trí riêng.
- Khoảng chạy mặc định của job tracking là 60 giây; cron expression vẫn hỗ trợ interval dưới một phút cho môi trường cần kiểm thử.
