import { AllocateRevenue } from "@/database/models/AllocateRevenue";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const AllocateRevenueSelectBasic: FindOptionsSelect<AllocateRevenue> = {
  id: true,
  fromDate: true,
  toDate: true,
  type: true,
  totalRevenue: true,
  totalAllocatedRevenue: true,
  totalUnallocatedRevenue: true,
  totalRevenueToAllocate: true,
  timeAt: true,
  note: true,
};

export const AllocateRevenueSelectFull: FindOptionsSelect<AllocateRevenue> = {
  ...AllocateRevenueSelectBasic,
};

export const AllocateRevenueRelations: FindOptionsRelations<AllocateRevenue> = {};
