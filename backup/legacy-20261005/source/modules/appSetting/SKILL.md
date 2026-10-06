# AppSetting Module Notes

- `AppSetting` lưu **một bản ghi duy nhất** cấu hình hệ thống dạng singleton (5 cụm JSON):
  - `order` — VAT %, commission % cho nhân viên bán hàng.
  - `customer` — `referralBonus` (số đơn người giới thiệu được thưởng khi khách được giới thiệu đặt đơn) và `referralThreshold` (giá trị đơn tối thiểu để nhận thưởng).
  - `employee` — `salesTargetBonus[]` (cấu hình thưởng phạt doanh số), `turnoverPenalty` (phạt nghỉ việc), `uniform` (tiền đồng phục), `margin` (tiền ký quỹ).
  - `voucher` — `minOrderValue` (giá trị đơn tối thiểu áp dụng voucher) và `pointToMoneyRate` (tỉ giá điểm thưởng → tiền).
  - `notification` — `preferences[]` (danh sách loại thông báo người dùng muốn nhận).
- Mặc dù kế thừa `BaseService<AppSetting>` (cho CRUD chuẩn), trong thực tế nghiệp vụ chỉ dùng **update** trên bản ghi duy nhất; FE thao tác trên 1 form tab cấu hình.
- `getVatAppSetting` (controller `/vat`) trả về phần trăm VAT hiện tại để áp dụng vào báo giá/hóa đơn, **không tạo request mới** nếu DB chưa có bản ghi (trả 0).
- Validator tách thành các schema con (`OrderSettingSchema`, `CustomerSettingSchema`, `EmployeeSettingSchema`, `VoucherSettingSchema`, `NotificationSettingSchema`) để FE/BE dùng lại khi validate từng phần.
- Khi thêm cấu hình mới: thêm field vào interface trong `database/models/AppSetting.ts`, thêm schema Zod tương ứng trong `appSetting.validator.ts`, cập nhật `AppSettingSelectBasic` trong `appSetting.select.ts`.
- `order` hiện có thêm các field vận hành ngoài `vat`/`commission`, gồm `checkInDistanceThreshold`, `orderStartNotificationMinutes`, `urgentOrderEnabled`, `urgentOrderHours`, `urgentOrderSurchargePercent`, `fragileItemSurchargePercent`; FE form/model phải giữ đủ các field này, nếu không lần save sẽ ghi đè mất dữ liệu JSON hiện có.
- Chu kỳ cảnh báo đơn hàng lưu trong `order.urgentOrderAlertIntervalMinutes` và `order.regularOrderAlertIntervalMinutes` (đơn vị phút, số nguyên không âm, mặc định `0`); lấy qua các getter cùng tên của `AppSettingRepository`.
- `AppSettingRepository.getBranchManagerRevenueShare()` đọc `order.branchManagerRevenueShare` từ bản ghi singleton, dùng làm mặc định cho `Order.allocateRevenuePercent` khi tạo hợp đồng.
