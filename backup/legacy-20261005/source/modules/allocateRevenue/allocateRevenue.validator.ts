import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
import { PositionDefaultEnum } from "@/shared/constants/constance";

export const AllocateRevenueToEmployeesSchema = z.object({
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  branchId: z.uuid().optional(),
  revenueSharePercent: z.coerce.number().min(0).max(100),
  allocationTarget: z.enum(PositionDefaultEnum),
});

export const CreateAllocateRevenueRecordSchema = z.object({
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  type: z.enum(PositionDefaultEnum).default(PositionDefaultEnum.BRANCH_MANAGER),
  totalRevenue: z.coerce.number(),
  totalAllocatedRevenue: z.coerce.number(),
  totalUnallocatedRevenue: z.coerce.number(),
  totalRevenueToAllocate: z.coerce.number(),
  employeeData: z.array(z.object({ employeeId: z.uuid(), allocatedRevenue: z.coerce.number() })),
  orderLeaderIds: z.array(z.uuid()),
});

export const CreateAllocateRevenueSchema = z.object({
  fromDate: z.coerce.date().nullable().optional(),
  toDate: z.coerce.date().nullable().optional(),
  type: z.enum(PositionDefaultEnum),
  totalRevenue: z.number(),
  totalAllocatedRevenue: z.number(),
  totalUnallocatedRevenue: z.number(),
  totalRevenueToAllocate: z.number(),
  timeAt: z.coerce.date(),
  note: z.string().nullish(),
});

export const UpdateAllocateRevenueSchema = z.object({
  fromDate: z.coerce.date().nullable().optional(),
  toDate: z.coerce.date().nullable().optional(),
  type: z.enum(PositionDefaultEnum).optional(),
  totalRevenue: z.number().optional(),
  totalAllocatedRevenue: z.number().optional(),
  totalUnallocatedRevenue: z.number().optional(),
  totalRevenueToAllocate: z.number().optional(),
  timeAt: z.coerce.date().optional(),
  note: z.string().nullish(),
});

export const AllocateRevenueQuerySchema = BaseSchema.extend({});

export const AllocateRevenueParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateAllocateRevenueDto = z.infer<typeof CreateAllocateRevenueSchema>;
export type UpdateAllocateRevenueDto = z.infer<typeof UpdateAllocateRevenueSchema>;
export type AllocateRevenueToEmployeesDto = z.infer<typeof AllocateRevenueToEmployeesSchema>;
export type CreateAllocateRevenueRecordDto = z.infer<typeof CreateAllocateRevenueRecordSchema>;
export type AllocateRevenueQueryDto = z.infer<typeof AllocateRevenueQuerySchema>;
export type AllocateRevenueParamsDto = z.infer<typeof AllocateRevenueParamsSchema>;
