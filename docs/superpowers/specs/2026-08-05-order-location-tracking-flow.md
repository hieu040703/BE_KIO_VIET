# Mô tả nghiệp vụ JobOrderLocationTracking đến bước lưu vị trí

Ngày: 2026-08-05

## 1. Mục tiêu

Mô tả luồng nghiệp vụ lấy vị trí của nhân viên phụ trách đơn hàng, bắt đầu từ job JobOrderLocationTracking gửi yêu cầu lấy vị trí qua Socket.IO và kết thúc tại bước lưu bản ghi vào bảng order_manager_locations.

Tài liệu này chỉ bao phủ đến bước persistence. Các bước tính ETA, cập nhật cache và thông báo vị trí mới cho khách hàng nằm ngoài phạm vi.

## 2. Thành phần tham gia

| Thành phần | Vai trò |
| --- | --- |
| JobOrderLocationTracking | Chạy định kỳ và gửi lệnh yêu cầu lấy vị trí |
| GoongMapService | Lấy danh sách order active và phát event Socket.IO |
| GoongMapRepository | Query order active, đọc vị trí gần nhất và lưu vị trí mới |
| Socket.IO | Chuyển event ping_location đến các socket của nhân viên |
| Mobile của nhân viên | Nhận ping, lấy GPS và gọi API cập nhật vị trí |
| order_manager_locations | Lưu lịch sử vị trí của nhân viên theo từng order |

## 3. Điều kiện để job có thể chạy

Khi API khởi động, `initializeApp()` gọi `initializeQueues()` và khởi động job:

~~~ts
JobOrderLocationTracking.start();
~~~

Job dùng Croner với timezone Asia/Ho_Chi_Minh. Với cấu hình mặc định, cron expression là:

~~~text
0 */1 * * * *
~~~

Job mặc định chạy mỗi 60 giây. `ORDER_TRACKING_PING_INTERVAL_SECONDS` được dùng để tạo cron expression; interval dưới một phút vẫn được biểu diễn ở trường giây.

## 4. Luồng tổng quát

~~~mermaid
sequenceDiagram
    participant Cron as JobOrderLocationTracking
    participant Service as GoongMapService
    participant DB as PostgreSQL
    participant Socket as Socket.IO
    participant Mobile as Mobile nhân viên

    Cron->>Service: sendPingRequestsForActiveOrders()
    Service->>DB: findActiveTrackingTargets()
    DB-->>Service: Các order active
    Service->>Socket: emit ping_location cho employeeUserId
    Socket-->>Mobile: ping_location
    Mobile->>Service: POST /v1/goong-maps/orders/:orderId/location
    Service->>DB: Đọc vị trí gần nhất của employee
    Service->>Service: Kiểm tra quyền, trạng thái, timestamp, interval, khoảng cách
    Service->>DB: createLocation() / repository.save()
~~~

## 5. Bước 1 — Job tìm các order cần tracking

### 5.1. Entry point

Mỗi lần Croner trigger, job resolve GoongMapService từ Inversify container rồi gọi:

~~~ts
await goongMapService.sendPingRequestsForActiveOrders();
~~~

Nếu query hoặc quá trình phát event bị lỗi, job ghi log Error in JobOrderLocationTracking và không throw lỗi ra ngoài callback. Timer vẫn tiếp tục cho lần chạy kế tiếp.

### 5.2. Điều kiện chọn order active

`findActiveTrackingTargets()` lấy nhân viên từ danh sách `OrderEmployee` của các đơn đang xử lý, với các điều kiện:

- trackedOrder.deletedAt IS NULL.
- trackedOrder.status = PROCESSING.
- `orderEmployee.deletedAt IS NULL`.
- `OrderEmployee.employee` và `employee.user` đều tồn tại; nhân viên không có user account bị loại ngay trong query.
- Không khử trùng giữa các đơn; mỗi dòng `OrderEmployee` hợp lệ tạo một target để vị trí được cập nhật theo đúng `orderId + employeeId`.

Kết quả query gồm:

- orderId.
- serviceOrderId.
- customerId.
- employeeId.
- employeeUserId: user account liên kết với employeeId.
- customerUserId.

Job chỉ sử dụng `employeeUserId` để gửi ping. Nếu nhân viên có trong `OrderEmployee` nhưng chưa có user account liên kết, nhân viên bị loại và không có ping nào được gửi. Nếu một nhân viên xuất hiện trong nhiều đơn, mỗi đơn nhận một ping riêng với `orderId` tương ứng.

### 5.3. Trạng thái lifecycle

Tracking theo job chạy cho các order đang ở trạng thái `PROCESSING`. Service order không được dùng làm điều kiện lọc trong query hiện tại.

## 6. Bước 2 — Gửi lệnh lấy vị trí qua Socket.IO

Với mỗi target có employeeUserId, service tạo command payload:

~~~json
{
  "orderId": "<order-id>",
  "serviceOrderId": "<service-order-id>",
  "employeeId": "<employee-id>",
  "trackingRoomId": "order-tracking:<order-id>",
  "requestedAt": "<ISO timestamp>",
  "reason": "scheduled"
}
~~~

Sau đó phát event:

~~~text
ping_location
~~~

Event được gửi đến các socket đang được đăng ký dưới employeeUserId. Job không chờ acknowledgement từ mobile và không có cơ chế retry cho một ping bị mất.

## 7. Bước 3 — Mobile gọi API cập nhật vị trí

Mobile nhận ping_location, lấy vị trí GPS rồi gọi:

~~~http
POST /v1/goong-maps/orders/:orderId/location
Content-Type: application/json
Authorization: Bearer <employee-token>
~~~

### 7.1. Request body

~~~json
{
  "latitude": 10.7769,
  "longitude": 106.7009,
  "accuracy": 8.5,
  "speedMetersPerSecond": 4.2,
  "heading": 90,
  "capturedAt": "2026-08-05T10:00:00.000Z",
  "source": "manager-mobile"
}
~~~

Quy tắc validation:

| Field | Quy tắc |
| --- | --- |
| latitude | Số từ -90 đến 90, bắt buộc |
| longitude | Số từ -180 đến 180, bắt buộc |
| accuracy | Số từ 0 đến 10000, nullable |
| speedMetersPerSecond | Số từ 0 đến 100, nullable |
| heading | Số từ 0 đến 360, nullable |
| capturedAt | Date hợp lệ, optional; mặc định là thời điểm server nhận request |
| source | Chuỗi từ 1 đến 50 ký tự; mặc định manager-mobile |

## 8. Bước 4 — Kiểm tra trước khi lưu

### 8.1. Xác thực nhân viên

employeeId được lấy từ JWT của request, không lấy từ request body.

Service đọc tracking context của order và cho phép cập nhật nếu employee hiện tại là:

- Nhân viên chính của order; hoặc
- Một order leader của order.

Nếu không có employeeId trong JWT, request bị từ chối. Nếu employee không thuộc order, request bị từ chối với lỗi quyền truy cập.

### 8.2. Kiểm tra trạng thái order

Order phải còn active theo cùng quy tắc với job:

- Order: PENDING.
- Service order: CONFIRMED nếu có liên kết service order.

Nếu order đã kết thúc, bị hủy hoặc đã chuyển trạng thái khác, API trả lỗi và không lưu vị trí.

### 8.3. Kiểm tra timestamp

Service lấy location mới nhất của cùng orderId và employeeId.

Nếu capturedAt của request nhỏ hơn hoặc bằng location gần nhất, request bị từ chối để tránh dữ liệu đi ngược thời gian.

### 8.4. Kiểm tra tần suất cập nhật

Khoảng cách giữa location mới và location gần nhất phải tối thiểu:

~~~text
GOONG_TRACKING_MIN_INTERVAL_SECONDS = 45 giây (default)
~~~

Nếu chưa đủ interval, API trả HTTP 429 và không lưu.

### 8.5. Tính khoảng cách với location trước

Nếu đã có location trước đó, service tính distanceFromPreviousMeters bằng công thức Haversine từ:

- latestLocation.latitude, latestLocation.longitude.
- dto.latitude, dto.longitude.

Nếu khoảng cách nhỏ hơn GOONG_DEDUP_DISTANCE_METERS (default 15 mét), API trả thành công nhưng đánh dấu:

~~~json
{
  "accepted": false,
  "skippedReason": "deduplicated"
}
~~~

Trường hợp này không tạo bản ghi mới trong order_manager_locations.

## 9. Bước 5 — Lưu order_manager_locations

Chỉ khi vượt qua tất cả kiểm tra và không bị deduplicate, service gọi:

~~~ts
await goongMapRepository.createLocation({
  orderId,
  employeeId,
  latitude: dto.latitude,
  longitude: dto.longitude,
  accuracy: dto.accuracy ?? null,
  speedMetersPerSecond: dto.speedMetersPerSecond ?? null,
  heading: dto.heading ?? null,
  capturedAt,
  source: dto.source ?? "manager-mobile",
  distanceFromPreviousMeters,
});
~~~

Repository thực hiện:

~~~ts
const entity = repository.create(data);
return repository.save(entity);
~~~

### 9.1. Mapping dữ liệu

| Cột order_manager_locations | Giá trị nguồn | Ghi chú |
| --- | --- | --- |
| orderId | Param URL | Order đang được tracking |
| employeeId | JWT | Không tin giá trị từ client body |
| latitude | Body | Tọa độ vĩ độ |
| longitude | Body | Tọa độ kinh độ |
| accuracy | Body hoặc null | Độ chính xác GPS, mét |
| speedMetersPerSecond | Body hoặc null | Tốc độ tại thời điểm ghi nhận |
| heading | Body hoặc null | Hướng di chuyển |
| distanceFromPreviousMeters | Service tính hoặc null | Null khi là location đầu tiên |
| capturedAt | Body hoặc new Date() | Thời điểm thiết bị ghi nhận |
| source | Body hoặc manager-mobile | Nguồn dữ liệu |
| id, createdAt, updatedAt | Database/BaseEntity | Sinh khi lưu entity |

Bảng có soft-delete qua deletedAt. Các query đọc location gần nhất chỉ lấy bản ghi có deletedAt IS NULL và sắp xếp theo capturedAt DESC.

## 10. Các nhánh kết quả trước bước lưu

| Điều kiện | Kết quả | Có lưu DB không? |
| --- | --- | --- |
| Không có employeeId trong JWT | Unauthorized | Không |
| Employee không thuộc order | Forbidden | Không |
| Order không còn active | Bad Request | Không |
| capturedAt không lớn hơn location trước | Bad Request | Không |
| Chưa đủ interval tối thiểu | HTTP 429 | Không |
| Khoảng cách dưới ngưỡng deduplicate | Success, accepted=false | Không |
| Dữ liệu hợp lệ | Success, accepted=true | Có |

## 11. Điểm cần kiểm tra khi triển khai

- Xác nhận `JobOrderLocationTracking.start()` được gọi trong `BE/src/index.ts` khi triển khai.
- Cron mặc định 60 giây, cần đồng bộ với interval cập nhật tối thiểu của API nếu thay đổi cấu hình.
- Xác nhận mobile có listener cho event ping_location và có gọi đúng endpoint cập nhật vị trí.
- Xác nhận Socket.IO được đăng ký đúng employeeUserId; nếu không có socket tương ứng, event sẽ không đến thiết bị.
- Job hiện đã tracking trong giai đoạn nhân viên đang thực hiện công việc (`PROCESSING`).

## 12. Source tham chiếu

- BE/src/queue/jobs/orderLocationTracking.job.ts
- BE/src/modules/goongMap/goongMap.repository.ts
- BE/src/modules/goongMap/goongMap.service.ts
- BE/src/modules/goongMap/goongOrderTracking.socket.ts
- BE/src/modules/goongMap/admin.goongMap.route.ts
- BE/src/database/models/OrderManagerLocation.ts
- BE/src/database/migrations/1775600000000-CreateOrderManagerLocations.ts
