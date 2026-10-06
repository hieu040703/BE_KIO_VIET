# Service Module Notes

- `ServicePrice` hiện dùng contract bắt buộc gồm `category`, `unit`, `quantity`, `price`, `excessUnitPrice`, `note`.
- Khi sửa schema `ServicePrice`, phải cập nhật đồng thời các điểm sau:
  - `src/database/models/ServicePrice.ts`
  - `src/database/migrations/*ServicePrices*.ts`
  - `src/modules/service/servicePrice/servicePrice.validator.ts`
  - `src/modules/service/servicePrice/servicePrice.select.ts`
  - `src/modules/service/service.select.ts`
  - `src/modules/service/admin.service.service.ts`
- `AdminServiceService.create/update` tách `prices` khỏi payload service và tự tạo lại bản ghi `service_prices`, nên field mới sẽ bị mất nếu không map ở đây.
- FE hiện nhập `servicePrices` tại `FE/src/pages/Private/service/components/AddUpdateModal.tsx`; thay đổi contract ở BE phải đồng bộ `FE/src/models/service.ts` và modal này.
