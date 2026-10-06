# User module

- `POST /users` validates `CreateUserSchema` and is handled by `UserService.createManager`.
- Tạo tài khoản hệ thống giữ `role` được gửi từ request; nếu client cũ không gửi role thì mặc định là `MANAGER`.
- FE hiển thị checkbox quản lý cho cả tạo và sửa tài khoản hệ thống, chuyển trạng thái checkbox thành `MANAGER` hoặc `EMPLOYEE` trước khi gửi API.
- `UpdateManagerSchema` phải khai báo `role` để request sửa người dùng không làm mất lựa chọn quản lý hệ thống.
- `POST /users/:id/reset-password` dùng permission `user.resetPassword`, hash chuỗi mặc định `123456` qua `AuthUtils.hashPassword`, rồi cập nhật `users.password`; endpoint không nhận password từ client.
