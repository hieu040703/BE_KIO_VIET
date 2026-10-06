# TimeKeepingConfirm — Module Notes

> Phiếu chấm công (lương) theo kỳ. 1 record = 1 bảng lương gộp cho 1 nhân viên
> trong 1 khoảng [startAt, endAt], chứa tổng hợp totalRealSalary, tạo khoản chi
> lương (Finance.SALARY) tương ứng, quản lý các khoản ký quỹ/đồng phục/bonus/penalty.

## Files

| File | Vai trò |
|---|---|
| `timeKeepingConfirm.types.ts` | DI symbols (TimeKeepingConfirmRepository, Service, Controller, Router) |
| `timeKeepingConfirm.container.ts` | Bind repo/service/controller/router vào Inversify container |
| `timeKeepingConfirm.repository.ts` | extends `BaseRepository<TimeKeepingConfirm>`; có `findByTKCId` (trỏ ngược về TimeKeeping via TKC ID) + `calculateTimeKeepingConfirm` (recalc total khi sửa CT) |
| `timeKeepingConfirm.service.ts` | extends `BaseService`; **override `delete`** — wrap `TransactionManager.withTransactionCallback` để cleanup trước khi xóa (xem "Delete flow" dưới) |
| `timeKeepingConfirm.controller.ts` | `BaseController<TimeKeepingConfirmService>` — chỉ thêm custom handler nếu cần |
| `timeKeepingConfirm.route.ts` | Express router: GET list/by-id, POST create (confirm), PUT update (updateHistory), DELETE |
| `timeKeepingConfirm.select.ts` | `SelectBasic` / `SelectFull` / `Relations` cho findOptions |
| `timeKeepingConfirm.validator.ts` | Zod schema: Create, Update (UpdateTimeKeepingConfirmDto), Export PDF |

## Entities chính

- `TimeKeepingConfirm` ([database/models/TimeKeepingConfirm.ts](../../../database/models/TimeKeepingConfirm.ts))
  - Field quan trọng: `isPaid` (đã thanh toán — chặn xóa/sửa), `totalRealSalary`, `totalAdvance`, `totalMargin`, `totalUniform`, `totalPenalty`, `totalBonus`
  - Relation: `OneToMany → TimeKeeping` (back-ref từ `TimeKeeping.timeKeepingConfirm`)
- `Finance.timeKeepingConfirmId` ([database/models/Finance.ts](../../../database/models/Finance.ts#L79))
  - `@OneToOne(() => TimeKeepingConfirm) @JoinColumn({ name: "timeKeepingConfirmId" })`
  - **Không có `onDelete`** — phải cleanup thủ công trước khi xóa TKC (xem "Delete flow")

## Service methods đáng chú ý

| Method | Vai trò |
|---|---|
| `findByTKCId(id)` | Wrapper repo, trả `ApiResponse<TimeKeepingConfirm \| null>` |
| `validateBeforeCreate` | Hiện không validate body — giữ method override để tương thích base class |
| `actionAfterCreate` | Tạo liên kết TimeKeepings ↔ TKC, tạo Margins cho ký quỹ/đồng phục, **tạo Finance SALARY `totalRealSalary`** |
| `updateHistory(id, data)` | Cập nhật phiếu chấm công — chỉ cho phép nếu `!isPaid`; hỗ trợ `removeTimeKeepingIds` |
| `validateBeforeDelete` | Chặn xóa nếu `isPaid` |
| **`delete` (override)** | **Xem "Delete flow"** |
| `exportTimeSheetPdf` | Export PDF bảng chấm công |
| `calculateTimeKeepingConfirm` | Recalc `totalRealSalary` sau khi sửa chi tiết |

## Delete flow — đã fix FK violation (2026-06-12)

**Bug:** `BaseService.delete` mặc định chạy `repository.delete()` (hard delete) TRƯỚC
rồi mới `actionAfterDelete`. Vì `finances.timeKeepingConfirmId` có FK trỏ tới
`time_keeping_confirms` (không có `onDelete`), bước `repository.delete` ném
`FK_ef9e7898bc77af6ba71116ef61b` violation. Cleanup ở `actionAfterDelete` không
bao giờ chạy được.

**Fix:** Override `delete` trong service, wrap toàn bộ trong
`TransactionManager.withTransactionCallback`:

```ts
// BE/src/modules/timeKeeping/timeKeepingConfirm/timeKeepingConfirm.service.ts:307
async delete(id, req?, _manager?): Promise<ApiResponse<Boolean>> {
  void _manager; // match BaseService.delete signature; tự tạo tx
  return await this.transactionManager.withTransactionCallback(async (tx) => {
    await this.validateBeforeDelete(id, req, tx);
    const exist = await this.timeKeepingConfirmRepository.findById(id, tx, false, req);
    if (!exist) throw new NotFoundError("Không tìm thấy phiếu chấm công");
    await this.cleanupBeforeDelete(exist, req, tx);              // (1) cleanup trước
    await this.timeKeepingConfirmRepository.delete(id, tx, req);  // (2) hard delete
    return ApiResponseHandler.deleteSuccess("OK", id);
  });
}
```

`cleanupBeforeDelete` (private) chứa toàn bộ logic từ `actionAfterDelete` cũ:
1. Update tất cả `TimeKeepings` có `timeKeepingConfirmId = data.id` → set null + `isPaid = false`
2. Với `TimeKeepings` margin/uniform + type IN → xóa `Margin` records + xóa luôn `TimeKeeping` đó
3. Tìm & xóa `Finance` records có `timeKeepingConfirmId = data.id` (giải phóng FK)

**Lesson:** Bất kỳ module nào có entity bị FK-reference từ entity khác mà không có
`onDelete: CASCADE/SET NULL` → phải override `delete` với transaction wrap, cleanup
dependent records trước. Xem thêm pattern tương tự: `Order → finances` đã dùng
`onDelete: 'CASCADE'` ở entity ([Finance.ts:98](../../../database/models/Finance.ts#L98))
nên KHÔNG gặp bug này.

## Routes

| Method | Path | Mô tả |
|---|---|---|
| GET | `/v1/time-keepings/histories` | List có pagination |
| GET | `/v1/time-keepings/histories/:id` | Chi tiết |
| POST | `/v1/time-keepings/histories` | Tạo phiếu chấm công (confirm flow) |
| PUT | `/v1/time-keepings/histories/:id` | Cập nhật (`updateHistory`) |
| DELETE | `/v1/time-keepings/histories/:id` | Xóa (đã fix) |
| (custom) | `/v1/time-keepings/histories/export-pdf` | Export PDF bảng chấm công |

## Business rules

1. **Tạo phiếu (`actionAfterCreate`)**:
   - Input body có `dataTimeKeeping: { timeKeepings, advanceDetails, penaltyDetails, bonusDetails, marginDetails, uniformDetails }` + `timeKeepingIds` (mảng id)
   - Mapping logic: id bắt đầu bằng `referrer`/`margin`/`uniform` = tạo mới, ngược lại = update existing
   - Tạo `Margin` record cho ký quỹ/đồng phục (auto type = MARGIN/UNIFORM, isAutomatic=true)
   - **Tạo `Finance` SALARY với `amount = totalRealSalary`**, status=PENDING, `isDebtRelated=false`
2. **Không sửa/xóa khi `isPaid = true`** (block ở `validateBeforeUpdate`/`validateBeforeDelete`); detail API trả `isPaid` để FE ẩn nút `Cập nhật`.
3. **Khi update có `removeTimeKeepingIds`**: set null + `isPaid=false` cho các TimeKeepings bị gỡ, rồi `calculateTimeKeepingConfirm` để recalc tổng. Toàn bộ flow chạy trong transaction và cập nhật lại `Finance.SALARY` đang `PENDING` theo `totalRealSalary` mới.
4. **Khi xóa**: xem "Delete flow"

## DI dependencies

```ts
@inject(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmRepository)
@inject(TIME_KEEPING_TYPES.TimeKeepingRepository)
@inject(FINANCE_TYPES.FinanceService)
@inject(EMPLOYEE_TYPES.EmployeeRepository)
@inject(MARGIN_TYPES.MarginService)
@inject(ORDER_TYPES.OrderRepository)
@inject(COMMON_TYPES.TransactionManager)   // ← thêm 2026-06-12 cho delete override
```

`COMMON_TYPES.TransactionManager` đã có sẵn binding ở `common.container.ts`,
không cần thay đổi `timeKeepingConfirm.container.ts` khi inject thêm.

## Tích hợp liên module

- `TimeKeeping` (`timeKeepings.timeKeepingConfirmId`) — link 1 TimeKeeping ↔ 0..1 TKC
- `Finance.timeKeepingConfirmId` — khoản chi lương tạo khi confirm phiếu
- `Margin` (cho ký quỹ/đồng phục) — tạo khi có TimeKeeping margin/uniform trong phiếu
- `Employee.timeKeepingConfirms` — back-ref ở Employee entity (list lịch sử chấm công)
- `Order.isReferrerPaid` — update khi thưởng `REFERRER_ORDER` (hoặc dữ liệu `BONUS` order cũ) được add vào phiếu
- `Order.isPaidForEmployeeCreateOrder` — update khi thưởng `CREATE_ORDER` được add vào phiếu
- `Order.hasAllocatedRevenue` — update khi khoản `ALLOCATED_REVENUE_ORDER` được add vào phiếu

## Phân quyền dữ liệu

- Với JWT `role = EMPLOYEE`, `validateBeforeQuery` tự thêm điều kiện `employeeId = req.user.employeeId` cho danh sách `/histories`; bộ lọc này không phụ thuộc query từ FE.
- `findByTKCId` từ chối trả chi tiết phiếu của nhân viên khác; tài khoản EMPLOYEE không có `employeeId` không được xem dữ liệu.

## Query danh sách

- Danh sách `/histories` dùng `TimeKeepingConfirmSelectList` và `TimeKeepingConfirmRelationsForList`, chỉ join thông tin `employee`; query chi tiết vẫn dùng `TimeKeepingConfirmSelectFull` và có `timeKeepings`.
- `searchableFields` của danh sách chỉ gồm `employee.name` và `employee.code`, không tìm trên `note` của phiếu hoặc các bản ghi `timeKeepings` để tránh trả về dữ liệu không liên quan.
- `BaseService.findAllWithPagination` ưu tiên `selectedFieldsForList`/`relationsForList` khi tạo query phân trang.
