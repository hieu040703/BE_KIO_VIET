# Vouchers Module Notes

- `Vouchers` stores customer-owned vouchers created by redeeming reward points from an active `VouchersTemplate`.
- A redeemed voucher belongs to both `userId` and `customerId`, expires 12 months after `redeemedAt`, and is usable once through `ServiceOrder.vouchersId`.
- Creating a client voucher should lock/check reward point balance and create a `RewardPointTypeEnum.REDEEMED` record for the template's point cost.
- Service order creation marks the voucher as used after ownership, expiry, and usage checks. Canceling a service order releases the voucher back to unused.
