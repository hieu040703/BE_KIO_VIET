# AllocateRevenue module

- Module quan ly lich su cac lan phan bo doanh thu cho nhan vien quan ly chi nhanh hoac ke toan.
- Preview phan bo doanh thu nam o `GET /v1/allocate-revenues/revenue`; endpoint nay tinh doanh thu tu order/orderLeader va chua ghi database.
- Xac nhan phan bo nam o `POST /v1/allocate-revenues/allocate-revenue`; endpoint nay tao ban ghi `AllocateRevenue`, tao timekeeping doanh thu cho tung nhan vien, va danh dau `OrderLeader.isRevenueShareAllocated`.
- Khi xac nhan, ghi `allocateRevenueId` vao cac `TimeKeeping` va `OrderLeader` lien quan de rollback dung tung lan phan bo.
- Khi xoa `AllocateRevenue`, soft-delete chinh ban ghi `AllocateRevenue`, soft-delete cac `TimeKeeping` lien quan va reset `OrderLeader.isRevenueShareAllocated = false`, `OrderLeader.allocateRevenueId = null`.
- FE dashboard phai goi endpoint qua `apiEndpoint.allocateRevenue.revenue` va `apiEndpoint.allocateRevenue.allocateRevenue`.
