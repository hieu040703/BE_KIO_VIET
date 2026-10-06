# TimeKeeping module

- `TimeKeeping.allocateRevenueId` links revenue-share payroll rows to an `AllocateRevenue` history record.
- Revenue allocation rows use `isRevenueShareAllocation = true`, `revenueShareStartDate`, `revenueShareEndDate`, and `allocateRevenueId`.
- When an `AllocateRevenue` record is deleted, linked `TimeKeeping` rows must be soft-deleted, not hard-deleted.
- When deleting a `TimeKeepingConfirm`, automatic margin/uniform `TimeKeeping` rows must be deleted before deleting their linked `Margin`; otherwise `time_keepings.marginId` triggers FK `23503`.
- Order rewards `REFERRER_ORDER`, `CREATE_ORDER`, and `ALLOCATED_REVENUE_ORDER` are included in the bonus totals and unpaid real-salary calculation alongside generic `BONUS`.
- Khi request có JWT `role = EMPLOYEE`, `GET /time-keepings` và `/all-summary` chỉ dùng `req.user.employeeId`, bỏ qua `employeeIds`/`keyword` do client gửi; thiếu `employeeId` trả dữ liệu rỗng.
- `TimeKeepingRepository.extendQueryBuilder` cũng giới hạn lookup trực tiếp theo `employeeId` của nhân viên đăng nhập.
