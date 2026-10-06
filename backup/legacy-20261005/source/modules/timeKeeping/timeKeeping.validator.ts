import { BaseSchema } from "@/shared/base/BaseSchema";
import { OtherAmountTypeEnum, TimeKeepingTypeEnum } from "@/shared/constants/constance";
import { z } from "zod";

export const CreateTimeKeepingSchema = z.object({
  type: z.enum(TimeKeepingTypeEnum).nullish(),
  employeeId: z.uuid(),
  timeKeepingConfirmId: z.uuid().nullish(),
  orderEmployeeId: z.uuid().nullish(),
  timeAt: z.coerce.date(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
  totalHours: z.number().nullish(),
  salary: z.number().nullish(),
  otherAmount: z.number().nullish(),
  otherAmountType: z.enum(OtherAmountTypeEnum).nullish(),
  advanceSalaryId: z.uuid().nullish(),
  marginId: z.uuid().nullish(),
  referrerOrderId: z.uuid().nullish(),
  isOvertime: z.boolean().optional(),
  isPaid: z.boolean().optional(),
  isCollected: z.boolean().optional(),
  referralAppliedDate: z.coerce.date().nullish(),
  referralEmployeeId: z.uuid().nullish(),
  referralConfigCode: z.string().nullish(),
  isRevenueShareAllocation: z.boolean().optional(),
  revenueShareStartDate: z.coerce.date().nullish(),
  revenueShareEndDate: z.coerce.date().nullish(),
  allocateRevenueId: z.uuid().nullish(),
  note: z.string().nullish(),
  tempId: z.uuid().nullish(),
});

export const CreateTimeKeepingWithOrderSchema = z.object({
  employeeIds: z.array(z.string()).optional(),
  details: z.array(CreateTimeKeepingSchema.omit({ employeeId: true, orderEmployeeId: true })),
});

export const UpdateTimeKeepingSchema = z.object({
  employeeId: z.uuid().optional(),
  orderEmployeeId: z.uuid().nullish(),
  timeAt: z.coerce.date().optional(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
  totalHours: z.number().nullish(),
  salary: z.number().nullish(),
  otherAmount: z.number().nullish(),
  otherAmountType: z.enum(OtherAmountTypeEnum).nullish(),
  isOvertime: z.boolean().optional(),
  note: z.string().nullish(),
  advanceSalaryId: z.uuid().nullish(),
  marginId: z.uuid().nullish(),
  allocateRevenueId: z.uuid().nullish(),
  tempId: z.uuid().optional(),
});

export const TimeKeepingQuerySchema = BaseSchema.extend({
  employeeIds: z.array(z.uuid()).optional(),
});

export const TimeKeepingParamsSchema = z.object({
  id: z.uuid(),
});

export const ConfirmTimeKeepingSchema = z.object({
  employeeId: z.uuid(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  dataTimeKeeping: z.any(),
  timeKeepingIds: z.array(z.string()),
  totalDayWorked: z.number().nullish(),
  totalHours: z.number().default(0),
  totalSalary: z.number().default(0),
  totalRealSalary: z.number().default(0),
  totalAdvance: z.number().optional().default(0),
  totalMargin: z.number().optional().default(0),
  totalUniform: z.number().optional().default(0),
  totalPenalty: z.number().optional().default(0),
  totalBonus: z.number().optional().default(0),
});

export type CreateTimeKeepingDto = z.infer<typeof CreateTimeKeepingSchema>;
export type CreateTimeKeepingWithOrderDto = z.infer<typeof CreateTimeKeepingWithOrderSchema>;
export type UpdateTimeKeepingDto = z.infer<typeof UpdateTimeKeepingSchema>;
export type TimeKeepingQueryDto = z.infer<typeof TimeKeepingQuerySchema>;
export type TimeKeepingParamsDto = z.infer<typeof TimeKeepingParamsSchema>;
export type ConfirmTimeKeepingDto = z.infer<typeof ConfirmTimeKeepingSchema>;
