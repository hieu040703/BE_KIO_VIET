# Customer module notes

- `client.customer.route.ts` keeps legacy `/:id/attachments` and `/:id/debts` public, so authenticated self-service endpoints must attach `authenticate` and `clientMiddleware` directly at route level.
- Customer self-profile updates now use `PUT /profile` and only accept `customName`, `address`, `email`, `dob`, `businessCode`, and `gender`, resolved from `req.user.customerId`.
- `customName` and `gender` must stay in customer validators and select configs so updated values are returned in customer-facing responses.
- Create/update Customer phải gọi `CommonService.validateUniquePhone()` để số điện thoại không trùng Customer hoặc Employee; kiểm tra update loại trừ chính customer đang sửa.
