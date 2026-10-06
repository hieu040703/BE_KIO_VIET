# Common Module Notes

- `CommonRepository.getCode(type, manager?)` centralizes generated business codes. Each type counts the target repository, pads the next number, checks existence, and returns the first available code.
- `CodeService.getCode` wraps `CommonRepository.getCode` in the shared API response shape `{ data: { code } }`.
- When adding a new code type, update `CodeType`, add a `CommonRepository.getCode` switch branch, inject the target repository if needed, and add a dedicated generator method.
- Service order codes use `CodeType` value `"ServiceOrder"` and prefix `DV` with six padded digits, for example `DV000001`.
- Endpoint `/common/test` vẫn có script referral cũ; nếu script này được chạy thủ công, nó phải lọc và tạo đúng `REFERRER_ORDER`, không dùng truy vấn chỉ theo `referrerOrderId` để tránh đụng các khoản thưởng order khác.
- `CommonService.validateUniquePhone()` là điểm dùng chung để chặn số điện thoại trùng giữa Employee và Customer; mọi truy vấn phải truyền cùng `EntityManager` và loại trừ ID hiện tại khi cập nhật.
