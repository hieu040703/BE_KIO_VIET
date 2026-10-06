## Branch module

- `Branch` đã có field `isInternal` ở entity; khi thêm field mới phải propagate tối thiểu qua `branch.validator.ts` và `branch.select.ts` để create/update/list trả dữ liệu đầy đủ.
- FE branch dùng `IBranch` làm contract chung cho page, table, modal và redux base saga; nếu BE trả thêm field thì cập nhật `FE/src/models/branch.ts` trước để tránh lệch type.
- Form thêm/sửa chi nhánh nằm ở `FE/src/pages/Private/branch/components/AddUpdateModal.tsx`; boolean field theo pattern `Form.Item + valuePropName="checked" + Switch`.
