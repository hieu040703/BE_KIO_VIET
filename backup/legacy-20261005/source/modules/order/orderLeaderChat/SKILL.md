# OrderLeaderChat

- Phòng chat quản lý nằm dưới `/orders/:orderId/leader-chat`.
- `ADMIN` luôn được vào; các role khác được vào khi `employeeId` có trong `order_leaders` active hoặc trùng `Order.createdByEmployeeId` của đơn hàng.
- Khi message có tag, người được tag nhận notification `MENTION` với tiêu đề `[Order.code] bạn có tin nhắn mới` và nội dung `${Người gửi} đã nhắc đến bạn trong hợp đồng ${Order.name}`; participant khác vẫn nhận notification `CHAT` hiện hữu.
- Message cursor/read checkpoint dùng `lastReadMessageId`, nhưng truy vấn thứ tự dùng `(timeAt, id)` để xử lý UUID và trường hợp trùng timestamp.
- Không tạo `ViewComment` cho model này. FE không được emit `join-room` generic; dùng socket event `order-leader-chat:*`.
