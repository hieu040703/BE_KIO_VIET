# Spec: CustomerService - Chăm sóc khách hàng

## Objective

Xây dựng tính năng quản lý lịch hẹn và lịch sử chăm sóc theo từng khách hàng.
Người dùng có quyền tương ứng có thể xem, tạo, sửa và xóa các lần chăm sóc ngay
từ bảng danh sách khách hàng trên FE.

### Success criteria

- Menu action của từng khách hàng có `Lịch sử chăm sóc` ở vị trí đầu tiên khi
  người dùng có quyền `customerService.read`.
- Popup lịch sử chỉ tải dữ liệu của khách hàng đang chọn, có phân trang và sắp
  xếp theo `scheduledAt` mới nhất trước.
- Người dùng có thể thêm, sửa và xóa bản ghi theo các quyền
  `customerService.create/update/delete`.
- BE kiểm tra customer, employee, trạng thái và quan hệ giữa các mốc thời gian.
- Migration có thể chạy lên và rollback mà không làm thay đổi các module ngoài
  phạm vi.

## Confirmed scope

### Fields

| Field | Required | Description |
|---|---:|---|
| `customerId` | Yes | Khách hàng được chăm sóc |
| `employeeId` | Yes | Nhân viên phụ trách |
| `method` | Yes | Phương thức chăm sóc |
| `status` | Yes | Trạng thái xử lý |
| `scheduledAt` | Yes | Thời gian dự kiến/thực hiện |
| `completedAt` | Conditional | Thời gian hoàn thành |
| `nextFollowUpAt` | No | Lịch chăm sóc tiếp theo |
| `note` | No | Nội dung ghi chú |

`method` dùng enum:

- `CALL`: Gọi điện
- `EMAIL`: Email
- `ZALO`: Zalo
- `SMS`: SMS
- `IN_PERSON`: Gặp trực tiếp
- `OTHER`: Khác

`status` dùng enum:

- `SCHEDULED`: Đã lên lịch
- `COMPLETED`: Đã hoàn thành
- `CANCELED`: Đã hủy

### Business rules

- `customerId` phải trỏ tới khách hàng đang tồn tại.
- `employeeId` phải trỏ tới nhân viên đang tồn tại.
- Nếu chuyển sang `COMPLETED` mà không truyền `completedAt`, BE tự gán thời điểm
  hiện tại.
- Nếu trạng thái khác `COMPLETED`, BE lưu `completedAt = null`.
- Nếu có `nextFollowUpAt`, giá trị phải sau `scheduledAt`.
- Xóa sử dụng soft-delete theo cơ chế sẵn có của `BaseEntity`.

### Out of scope

- Không có trang hoặc sidebar độc lập cho Chăm sóc khách hàng.
- Không gửi notification/reminder cho lịch chăm sóc.
- Không có màn hình cấu hình phương thức động.
- Không thêm trạng thái `Đang thực hiện` hoặc lưu `Quá hạn`; quá hạn có thể được
  suy ra từ dữ liệu khi cần trong tương lai.
- Không chạy migration lên database trong phạm vi triển khai nếu chưa được yêu
  cầu riêng.

## Architecture

### Naming

Module kỹ thuật dùng tên `customerCare` để tránh xung đột với class
`CustomerService` hiện có tại module `customer`. Tên hiển thị nghiệp vụ vẫn là
`CustomerService - Chăm sóc khách hàng`; permission key là `customerService`.

### Backend

- Tạo entity `CustomerCare`, table `customer_cares`.
- Quan hệ many-to-one tới `Customer` và `Employee`.
- Index `(customerId, scheduledAt)` phục vụ truy vấn lịch sử theo khách hàng.
- Module `BE/src/modules/customerCare/` tuân theo cấu trúc CRUD hiện có:
  repository, service, controller, route, validator, select, types và container.
- Route được mount trong admin router và bảo vệ bằng permission middleware.
- Thêm migration có `up` và `down`.

### API contract

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/customer-services` | `customerService.read` | Danh sách phân trang; `customerId` bắt buộc |
| POST | `/customer-services` | `customerService.create` | Tạo bản ghi |
| GET | `/customer-services/:id` | `customerService.read` | Xem một bản ghi |
| PUT | `/customer-services/:id` | `customerService.update` | Cập nhật bản ghi |
| DELETE | `/customer-services/:id` | `customerService.delete` | Soft-delete bản ghi |

Danh sách trả kèm dữ liệu quan hệ cần hiển thị của customer và employee. API dùng
response/error conventions hiện có; input được kiểm tra bằng Zod tại route.

### Permission

Thêm `customerService` vào danh sách module permission. CRUD được điều khiển bởi
`create`, `read`, `update`, `delete` và cấu hình qua permission group hiện có.

### Frontend

- Mở rộng action menu dùng chung bằng callback riêng cho
  `Lịch sử chăm sóc`; item này đứng đầu danh sách.
- Customer page giữ customer đang chọn và trạng thái mở popup lịch sử.
- Popup rộng hiển thị tên/mã khách hàng và bảng gồm:
  `scheduledAt`, employee, method, status, `completedAt`, `nextFollowUpAt`,
  note và action.
- Button `Thêm chăm sóc` và action sửa/xóa được ẩn theo permission.
- Form thêm/sửa dùng employee select, method select, status select, date-time
  picker và textarea.
- `completedAt` chỉ hiển thị khi status là `COMPLETED`; mặc định là thời điểm
  hiện tại khi người dùng chọn trạng thái này.
- Sau CRUD thành công, popup tải lại đúng trang dữ liệu; có loading, empty state,
  thông báo lỗi và xác nhận trước khi xóa.

## Data flow

1. Người dùng mở action `Lịch sử chăm sóc` tại một customer row.
2. FE mở modal và gọi danh sách với `customerId`, `page`, `size`.
3. BE kiểm tra quyền và query `customer_cares` chưa bị xóa của customer đó.
4. Thao tác thêm/sửa gửi input qua validator, service kiểm tra business rules và
   quan hệ rồi lưu.
5. Thao tác xóa qua confirm dialog và soft-delete.
6. FE tải lại danh sách sau mutation thành công.

## Tech stack and conventions

- BE: Node 24, Express 5, TypeORM 0.3, Inversify 7, Zod 4, Jest.
- FE: React 18, Vite 7, TypeScript 5, Redux Toolkit/redux-saga, Ant Design,
  Tailwind 3.
- TypeScript, 2 spaces, semicolon, double quotes, `printWidth: 100`.
- Class dùng PascalCase; file/module dùng camelCase; enum value dùng
  UPPER_SNAKE_CASE.

Ví dụ contract:

```ts
interface CreateCustomerCareDto {
  customerId: string;
  employeeId: string;
  method: CustomerCareMethod;
  status: CustomerCareStatus;
  scheduledAt: Date;
  completedAt?: Date | null;
  nextFollowUpAt?: Date | null;
  note?: string | null;
}
```

## Project structure

```text
BE/src/database/models/CustomerCare.ts
BE/src/database/migrations/<timestamp>-CreateCustomerCare.ts
BE/src/modules/customerCare/
BE/src/modules/customerCare/SKILL.md
FE/src/models/customerCare.ts
FE/src/api/customerCare/
FE/src/hooks/useCustomerCareData.ts
FE/src/pages/Private/customer/components/customerCare/
```

Các file đăng ký model, DI, router, permission và shared action menu được cập nhật
tối thiểu theo pattern hiện có.

## Commands

Chạy trong đúng sub-repo:

```bash
cd BE
npx jest src/modules/customerCare
npm run build

cd ../FE
npm run build
```

FE không có test script; cần kiểm tra thủ công luồng popup sau build.

## Testing strategy

### Backend

- Validator: enum, UUID, ngày bắt buộc và payload update.
- Service:
  - tạo bản ghi hợp lệ;
  - reject customer/employee không tồn tại;
  - tự gán `completedAt` khi hoàn thành;
  - xóa `completedAt` khi status không phải `COMPLETED`;
  - reject `nextFollowUpAt <= scheduledAt`;
  - query bị giới hạn theo `customerId`.
- Migration và TypeScript được kiểm tra qua build; không tự chạy migration trên DB.

### Frontend

- `npm run build`.
- Manual:
  - action đứng đầu và ẩn/hiện đúng quyền;
  - mở đúng customer;
  - thêm, sửa, xóa và reload;
  - conditional `completedAt`;
  - loading, empty, validation error và API error.

## Boundaries

### Always

- Validate input tại API boundary và lặp lại business rule tại service.
- Giữ `customerId` bắt buộc khi query danh sách.
- Dùng permission ở cả BE route và FE visibility.
- Cập nhật `BE/src/modules/customerCare/SKILL.md` sau thay đổi module.
- Giữ từng sub-repo build được độc lập.

### Ask first

- Thêm dependency.
- Chạy migration hoặc lệnh DB lên môi trường có dữ liệu.
- Thay đổi permission semantics dùng chung.
- Thêm notification/reminder hoặc trang quản lý độc lập.

### Never

- Commit `.env`, secret hoặc generated credentials.
- Bỏ qua permission chỉ vì FE đã ẩn action.
- Hard-delete lịch sử chăm sóc.
- Refactor module customer hoặc action menu ngoài phần cần thiết cho feature.

## Error handling

- Payload sai: lỗi validation theo middleware hiện có.
- Customer/employee không tồn tại: not-found/bad-request theo conventions hiện có.
- Quan hệ thời gian không hợp lệ: bad-request có message cụ thể.
- Không có permission: middleware trả forbidden trước controller.
- FE giữ modal mở khi mutation lỗi và hiển thị lỗi để người dùng sửa.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Trùng tên với `CustomerService` hiện có | Dùng tên kỹ thuật `customerCare` |
| Shared action menu ảnh hưởng bảng khác | Thêm optional callback, giữ nguyên thứ tự các item cũ |
| FE gửi dữ liệu thời gian không nhất quán | BE là nguồn xác thực cuối cùng |
| Permission chỉ được áp dụng ở UI | Bắt buộc middleware trên từng route |
| Query tải toàn bộ lịch sử | `customerId` bắt buộc, có pagination và index |

## Open questions

Không còn câu hỏi mở trong phạm vi đã duyệt.
