# Phương án triển khai: phân quyền EmployeeTicket và người tham gia trao đổi

## 1. Phạm vi và giả định

- “Chỉ ADMIN/MANAGER được truy cập quản lý” được hiểu là truy cập **toàn bộ inbox và thao tác quản lý** trên Admin/Web. App mobile của nhân viên vẫn cần cho nhân viên xem/reply ticket do mình tạo hoặc được gắn tham gia.
- `ADMIN` luôn có toàn quyền EmployeeTicket.
- `MANAGER` chỉ được vào inbox toàn bộ khi được cấp quyền module `employeeTicket`.
- Người được gắn vào ticket là tài khoản nội bộ đang active; khuyến nghị không cho chọn role `USER` vì đây thường là tài khoản khách hàng.
- Không thay đổi bounded context hiện tại: tiếp tục dùng `employee_tickets` và `employee_ticket_replies`, không dùng lại bảng customer ticket.

## 2. Hiện trạng và khoảng thiếu

Module hiện tại đã có:

- `EmployeeTicketTypeEnum`, `EmployeeTicketStatusEnum` và `EmployeeTicketReplyTypeEnum`.
- Quyền module `employeeTicket` với các permission dùng chung như `read`, `update`.
- Broadcast ticket mới tới ADMIN và các tài khoản có quyền đọc.
- Middleware kiểm tra tài khoản active, nhân viên active, quyền đọc và quyền xử lý.
- Repository có policy scope theo employee khi request không có quyền xem toàn bộ.

Khoảng cần xử lý:

1. Hàm đọc toàn bộ hiện đang dựa chủ yếu vào permission, chưa giới hạn rõ role `MANAGER`; cần xác định `ADMIN` hoặc `MANAGER` có permission mới được xem toàn bộ.
2. Scope owner hiện chưa bao gồm người được gắn tham gia ticket.
3. Chưa có bảng ACL theo từng ticket để lưu người tham gia, người gắn và lịch sử gỡ.
4. Luồng reply và notification chưa tính union giữa owner, participant và nhóm quản lý.

## 3. Quyết định kiến trúc đề xuất

### 3.1. Kết hợp RBAC và ACL

- **RBAC cấp module:** xác định ADMIN/MANAGER có được quản lý toàn bộ EmployeeTicket hay không.
- **ACL cấp ticket:** xác định owner hoặc participant có được xem/reply một ticket cụ thể hay không.
- Không ghi danh sách `participantIds` vào JSON của `employee_tickets`: cách này khó tạo unique constraint, khó query list, không có audit rõ ràng và dễ tạo lỗi khi concurrent update.

### 3.2. Ma trận quyền

| Actor | Xem toàn bộ ticket | Xem ticket owner/được gắn | Reply | Đổi status/close | Gắn/gỡ participant |
|---|---:|---:|---:|---:|---:|
| `ADMIN` active | Có | Có | Có | Có | Có |
| `MANAGER` active + `employeeTicket.read` | Có | Có | Theo `employeeTicket.update` | Cần `employeeTicket.update` | ADMIN-only trong MVP |
| `MANAGER` không có `read` nhưng được gắn ticket | Không | Có | Có | Không | Không |
| Nhân viên active là owner | Không | Ticket của mình | Có | Không | Không |
| Nhân viên active là participant | Không | Ticket được gắn | Có | Không | Không |
| Tài khoản khác, không owner/participant | Không | Không | Không | Không | Không |

Quy ước cấp quyền cho một MANAGER được “quản lý đầy đủ”:

```text
employeeTicket: ["read", "update"]
```

Trong đó:

- `read`: được truy cập inbox và xem toàn bộ dữ liệu ticket.
- `update`: được reply với tư cách người xử lý, đổi trạng thái và đóng ticket.
- ADMIN bypass các permission này.
- Kiểm tra role phải nằm ở backend. FE chỉ ẩn/disable UI để UX, không được xem là security boundary.

### 3.3. Quyền gắn người

Khuyến nghị MVP chỉ cho `ADMIN` thực hiện add/remove participant. Đây là thao tác cấp quyền đọc dữ liệu theo từng ticket, nên nếu mọi MANAGER có `update` đều được chia sẻ ticket sẽ có nguy cơ privilege escalation.

Nếu nghiệp vụ bắt buộc MANAGER được chia sẻ ticket, bổ sung permission riêng vào hệ thống permission:

```text
employeeTicket: ["read", "update", "share"]
```

Khi đó chỉ `ADMIN` hoặc `MANAGER` có `employeeTicket.share` được gọi API add/remove. Không dùng `update` để ngầm đại diện cho `share`.

## 4. Thiết kế bảng participant

Tên bảng đề xuất: `employee_ticket_participants`.

### 4.1. Cột dữ liệu

| Cột | Kiểu | Bắt buộc | Mục đích |
|---|---|---:|---|
| `id` | UUID | Có | ID của membership record |
| `employeeTicketId` | UUID | Có | FK tới `employee_tickets`, `CASCADE` khi xóa ticket |
| `userId` | UUID | Có | FK tới `users`, `RESTRICT` khi xóa user |
| `addedByUserId` | UUID | Có | User đã gắn participant, lấy từ JWT |
| `removedByUserId` | UUID | Không | User thực hiện gỡ participant |
| `createdAt` | timestamp | Có | Thời điểm được gắn |
| `updatedAt` | timestamp | Có | Thời điểm cập nhật record |
| `deletedAt` | timestamp | Không | Soft-delete khi gỡ participant |

MVP không cần cột `role`/`type`: mọi participant đều có quyền xem và reply. Các enum type/status/reply hiện tại vẫn giữ nguyên. Nếu sau này có `WATCHER` chỉ xem hoặc `COLLABORATOR` được reply, lúc đó thêm `EmployeeTicketParticipantRoleEnum` thay vì dùng boolean khó mở rộng.

### 4.2. Constraint và index

```sql
CREATE UNIQUE INDEX "UQ_employee_ticket_participants_active"
ON "employee_ticket_participants" ("employeeTicketId", "userId")
WHERE "deletedAt" IS NULL;

CREATE INDEX "IDX_employee_ticket_participants_userId_active"
ON "employee_ticket_participants" ("userId")
WHERE "deletedAt" IS NULL;

CREATE INDEX "IDX_employee_ticket_participants_ticketId_active"
ON "employee_ticket_participants" ("employeeTicketId")
WHERE "deletedAt" IS NULL;
```

Hành vi add phải idempotent: nếu membership active đã tồn tại thì không tạo duplicate. Nếu membership cũ đã soft-delete thì tạo record active mới để không mất lịch sử add/remove.

Không backfill owner/creator vào bảng này. Quyền owner vẫn lấy từ `employee_tickets.employeeId`/`createdByUserId`; như vậy migration không làm thay đổi quyền các ticket cũ.

## 5. API contract đề xuất

Base path hiện tại:

```text
/v1/employee-tickets
```

Các API dùng response envelope hiện tại của backend (`statusCode`, `success`, `message`, `data`, và `pagination` nếu là list).

### 5.1. Danh sách user có thể gắn

```http
GET /v1/employee-tickets/participant-candidates?keyword=&page=1&size=20
```

- Chỉ ADMIN ở MVP; hoặc ADMIN/MANAGER có `employeeTicket.share` nếu mở rộng.
- Chỉ trả user active thuộc nhóm tài khoản nội bộ: `ADMIN`, `MANAGER`, `SUPPORT`, `EMPLOYEE`.
- Chỉ trả field tối thiểu: `id`, `name`, `email`/`phone` nếu được phép hiển thị, `role`, `employee` summary.
- Không trả password, token, permission JSON đầy đủ hoặc dữ liệu customer.

Có thể tái sử dụng API user picker nếu API đó đã có scope tương đương. Không dùng API user tổng quát nếu nó có thể trả role `USER` hoặc lộ field nhạy cảm.

### 5.2. Xem participant của một ticket

```http
GET /v1/employee-tickets/:id/participants
```

Quyền đọc giống ticket detail: ADMIN, MANAGER có `read`, owner hoặc participant active.

Response item đề xuất:

```json
{
  "id": "participant-record-uuid",
  "userId": "user-uuid",
  "user": {
    "id": "user-uuid",
    "name": "Nguyễn Văn A",
    "role": "EMPLOYEE"
  },
  "addedByUserId": "admin-uuid",
  "createdAt": "2026-08-28T08:00:00.000Z"
}
```

### 5.3. Gắn một hoặc nhiều user

```http
POST /v1/employee-tickets/:id/participants
Content-Type: application/json

{
  "userIds": [
    "user-uuid-1",
    "user-uuid-2"
  ]
}
```

Validation đề xuất:

- `userIds` là UUID array, tối thiểu 1, tối đa 50 item/request.
- Dedupe input trước khi xử lý.
- Server lấy `addedByUserId` từ JWT, không nhận từ body.
- Chỉ user active và role nội bộ hợp lệ mới được gắn.
- Không cho gắn user đã là owner/creator; trường hợp này nên trả lỗi validation rõ ràng hoặc bỏ qua theo policy đã chốt.
- Transaction all-or-nothing cho batch: nếu có user ID không hợp lệ thì không gắn một phần.
- Record active đã tồn tại được xem là thành công idempotent.

Sau khi commit, gửi direct notification cho user mới được gắn với `metadata.employeeTicketId`; không đưa nội dung ticket nhạy cảm vào notification preview nếu user chưa có quyền đọc trước đó.

### 5.4. Gỡ participant

```http
DELETE /v1/employee-tickets/:id/participants/:userId
```

- Chỉ ADMIN ở MVP hoặc caller có `employeeTicket.share` theo nhánh mở rộng.
- Soft-delete record và ghi `removedByUserId` từ JWT.
- Không thể gỡ owner/creator vì owner không phải participant record.
- Nên xử lý idempotent; membership đã gỡ có thể trả success với trạng thái hiện tại.
- Không gửi nội dung ticket cho user sau khi bị gỡ. Nếu cần thông báo gỡ, chỉ gửi thông điệp tối thiểu không chứa dữ liệu ticket.

## 6. Tích hợp access scope vào các luồng hiện tại

### 6.1. Ticket list/detail

Policy backend:

```text
global access = ADMIN hoặc MANAGER active có employeeTicket.read
ticket access = global access
             hoặc owner hiện tại
             hoặc EXISTS active participant với userId = req.user.userId
```

Policy này phải áp dụng đồng nhất cho:

- `GET /v1/employee-tickets`.
- `GET /v1/employee-tickets/:id`.
- `GET /v1/employee-tickets/:id/replies`.
- `POST /v1/employee-tickets/:id/replies`.
- `GET /v1/employee-tickets/:id/participants`.

Đặc biệt, direct-by-ID không được bỏ qua ACL vì đây là đường dễ gây lộ dữ liệu nhất.

### 6.2. Reply

- Owner và participant được reply, nhưng không được đổi status/close.
- ADMIN reply giữ type `ADMIN`.
- MANAGER có quyền xử lý reply dùng type `AUTHORIZED_USER`.
- Owner/participant dùng type `EMPLOYEE`; không cần thêm enum mới trong MVP vì `userId` đã xác định người gửi.
- Không tin `userId`, `employeeTicketId`, `type` từ payload; server derive từ JWT và route param.
- Giữ nguyên giới hạn content/attachments hiện tại.

### 6.3. Notification

Recipient của reply là union đã dedupe:

```text
active ADMIN
+ active MANAGER có employeeTicket.read
+ ticket owner/creator
+ active participants
- actor hiện tại
```

Ticket mới tiếp tục broadcast tới nhóm quản lý toàn cục. Participant add gửi direct notification đến participant mới. Tất cả notification write đi qua transaction manager theo quy ước module hiện tại.

Metadata tối thiểu nên thống nhất:

```json
{
  "employeeTicketId": "ticket-uuid",
  "event": "PARTICIPANT_ADDED"
}
```

`event` nên được khai báo bằng enum domain nếu codebase cần dùng để routing/deep-link; app mobile chỉ cần map `employeeTicketId` sang màn hình chi tiết ticket.

## 7. Các phase triển khai

### Phase 1: Chốt contract và permission helper

**Mục tiêu:** khóa hành vi ADMIN/MANAGER trước khi thêm ACL.

**Công việc:**

- Thêm helper rõ nghĩa `canManageEmployeeTickets` và `canUpdateEmployeeTickets`.
- Giới hạn global access đúng `ADMIN` hoặc `MANAGER` có `employeeTicket.read`.
- Giữ owner access cho mobile employee.
- Cập nhật notification recipient để không broadcast cho role ngoài policy.

**Acceptance criteria:**

- MANAGER không có `read` không vào được inbox toàn bộ.
- MANAGER có `read` xem được toàn bộ; có thêm `update` mới đổi status/close/reply với tư cách manager.
- EMPLOYEE owner vẫn tạo/xem/reply ticket của mình.
- ADMIN vẫn full access.

**Verification:** focused Jest permission/middleware/service tests và `yarn build` trong `BE/`.

### Phase 2: Entity và migration participant

**Mục tiêu:** tạo store ACL riêng, không thay đổi dữ liệu ticket cũ.

**Công việc:**

- Thêm `EmployeeTicketParticipant` entity, relation từ `EmployeeTicket`.
- Thêm repository/select/container/types theo convention module.
- Thêm migration table, FK, partial unique index và các index lookup.
- Đăng ký entity vào model/data source.

**Acceptance criteria:**

- Một user không có hai membership active trên cùng ticket.
- Xóa ticket cascade participant; xóa user bị restrict.
- Soft-delete participant không làm mất lịch sử.
- Không có backfill owner/creator.

**Verification:** migration SQL review, migration test/schema check trong môi trường được phê duyệt; không tự chạy migration trên DB remote.

### Checkpoint 1: Schema và quyền nền

- [ ] Permission matrix được review.
- [ ] Migration chạy được trên database local/staging.
- [ ] Existing ticket list/detail/reply không regress.

### Phase 3: Participant API

**Mục tiêu:** ADMIN gắn/gỡ và xem người tham gia.

**Công việc:**

- Thêm validator cho candidate query, participant list, batch add và remove.
- Thêm service/controller/route.
- Enforce actor từ JWT, active user và internal-role allowlist.
- Add/remove transactionally và phát notification add.

**Acceptance criteria:**

- Batch add 1 hoặc nhiều user hoạt động và idempotent.
- User ngoài allowlist, inactive user, owner/creator và UUID không hợp lệ bị chặn đúng mã lỗi.
- Gỡ participant không xóa reply cũ.
- Caller không có quyền không thể gọi thành công dù sửa payload.

**Verification:** focused API/service tests cho allow/deny, duplicate, soft-delete, transaction rollback và notification recipient.

### Phase 4: Tích hợp ACL vào list/detail/reply

**Mục tiêu:** participant thực sự dùng được ticket trên mobile.

**Công việc:**

- Mở rộng repository policy bằng `EXISTS` active participant.
- Dùng cùng policy cho list, detail, reply list và reply create.
- Cập nhật reply recipient union và loại trừ actor.
- Cập nhật response detail/list nếu cần thêm `participants` summary hoặc `participantCount`.

**Acceptance criteria:**

- Participant chỉ thấy ticket được gắn, không thấy ticket khác.
- Participant truy cập trực tiếp bằng ID không bypass được policy.
- Participant reply thành công nhưng không đổi status/close.
- MANAGER có quyền xem toàn bộ vẫn thấy ticket dù không nằm trong participant table.

**Verification:** focused repository/service tests, API smoke có tài khoản owner/participant/manager/admin.

### Checkpoint 2: End-to-end backend

- [ ] Admin tạo ticket → add participant → participant nhận notification.
- [ ] Participant mở deep-link → xem detail/replies → reply.
- [ ] Admin gỡ participant → participant không còn truy cập ticket.
- [ ] MANAGER permissioned quản lý toàn bộ; MANAGER không permission bị 403.

### Phase 5: Admin Web và mobile contract

**Mục tiêu:** hoàn thiện thao tác vận hành và bàn giao contract cho app mobile riêng.

**Công việc:**

- FE Admin: picker user, danh sách participant, add/remove, loading/error/duplicate state.
- Mobile: thêm ticket được share vào list, detail participant summary và reply flow dùng chung API.
- Cập nhật `employeeTicket.mobile-api.md` với participant endpoints, ACL, notification deep-link và error codes.
- Không đưa mobile employee UI vào FE Admin repo nếu mobile là app riêng.

**Acceptance criteria:**

- Admin thấy rõ ai đang tham gia, ai đã gắn bởi ai và thời điểm.
- Mobile retry add/reply không tạo duplicate membership/reply ngoài policy idempotency hiện tại.
- App xử lý tối thiểu lỗi `401`, `403`, `404`, `422` và mở đúng `employeeTicketId`.

**Verification:** BE build/focused tests; FE build/type check; mobile integration test hoặc contract test theo stack mobile.

## 8. Rủi ro và giảm thiểu

| Rủi ro | Mức độ | Giảm thiểu |
|---|---:|---|
| MANAGER có permission nhưng role khác bị coi là global manager | Cao | Helper kiểm tra role + permission, test ma trận role đầy đủ |
| Direct-by-ID bypass participant ACL | Cao | Repository policy dùng chung cho list và detail/reply |
| Add cùng participant nhiều lần do retry/mobile timeout | Cao | Partial unique index + add idempotent trong transaction |
| Gỡ rồi add lại làm mất audit | Trung bình | Soft-delete row cũ, insert active row mới |
| Gắn nhầm tài khoản khách hàng | Cao | Candidate API allowlist role nội bộ, không nhận user tùy ý từ client |
| Notification gửi trùng hoặc lộ nội dung cho người vừa bị gỡ | Trung bình | Dedupe recipient, chỉ direct notify người mới được gắn, không gửi payload nhạy cảm |
| Permission `share` bị cấp rộng ngoài ý muốn | Cao | MVP ADMIN-only; nếu mở rộng thì thêm permission riêng và audit |

## 9. Quyết định cần xác nhận trước khi code

Phương án khuyến nghị để triển khai ngay:

1. `ADMIN` full access; `MANAGER` cần `employeeTicket.read`, và để quản lý đầy đủ cấp thêm `employeeTicket.update`.
2. Chỉ `ADMIN` được add/remove participant ở MVP.
3. Participant chỉ là tài khoản nội bộ active; có quyền xem/reply ticket được gắn.
4. Dùng bảng `employee_ticket_participants`, không backfill owner/creator và không thêm enum participant role ở MVP.

Nếu muốn MANAGER có quyền gắn người, chỉ cần chốt thêm `employeeTicket.share`; không nên mở rộng ngầm từ `update`.
