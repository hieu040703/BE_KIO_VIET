# Vouchers Template Module Notes

- `VouchersTemplate` stores redeemable voucher definitions for reward points: `name`, unique `code`, required `points`, discount `amount`, and `status`.
- Client reads should expose only active templates; admin routes manage the full CRUD surface.
- Templates are referenced by `Vouchers.vouchersTemplateId`; changing `points` or `amount` affects future redemptions only.
