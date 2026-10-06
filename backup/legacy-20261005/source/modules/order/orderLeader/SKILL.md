# OrderLeader module

- `OrderLeader.allocateRevenueId` records which `AllocateRevenue` history entry marked the leader's `revenueShare` as allocated.
- Confirming revenue allocation sets `isRevenueShareAllocated = true` and stores `allocateRevenueId`.
- Deleting the related `AllocateRevenue` must reset `isRevenueShareAllocated = false` and clear `allocateRevenueId`.
