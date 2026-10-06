import { BaseSchema } from "@/shared/base/BaseSchema";
import { ExpenseApprovalStatusEnum, FinanceTypeEnum } from "@/shared/constants/constance";
import { z } from "zod";

export const CreateAdvanceEmployeeSchema = z.object({
  branchId: z.uuid().nullish(),
  code: z.string().optional(),
  type: z.enum([FinanceTypeEnum.ADVANCE_EMPLOYEE, FinanceTypeEnum.REIMBURSE, FinanceTypeEnum.SETTLEMENT]),
  userId: z.uuid().optional(),
  category: z.string().default("Tạm ứng nhân viên").optional(),
  amount: z.number(),
  employeeId: z.uuid().nullish(),
  customerId: z.uuid().nullish(),
  orderId: z.uuid().nullish(),
  timeAt: z.coerce.date(),
  note: z.string().nullish(),
  status: z.enum(ExpenseApprovalStatusEnum).optional(),
  tempId: z.uuid().optional(),
});

export const UpdateAdvanceEmployeeSchema = z.object({
  branchId: z.uuid().nullish(),
  code: z.string().optional(),
  type: z.enum([FinanceTypeEnum.ADVANCE_EMPLOYEE, FinanceTypeEnum.REIMBURSE, FinanceTypeEnum.SETTLEMENT]).optional(),
  userId: z.uuid().optional(),
  category: z.string().default("Tạm ứng nhân viên").optional(),
  amount: z.number().optional(),
  employeeId: z.uuid().nullish(),
  customerId: z.uuid().nullish(),
  orderId: z.uuid().nullish(),
  timeAt: z.coerce.date().optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const AdvanceEmployeeQuerySchema = BaseSchema.extend({
  branchIds: z.array(z.uuid()).optional(),
  employeeIds: z.array(z.uuid()).optional(),
  type: z.enum([FinanceTypeEnum.ADVANCE_EMPLOYEE, FinanceTypeEnum.REIMBURSE, FinanceTypeEnum.SETTLEMENT]).optional(),
  status: z.enum(ExpenseApprovalStatusEnum).optional(),
  sortBy: z.string().default("timeAt").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC").optional(),
});

export const AdvanceEmployeeParamsSchema = z.object({
  id: z.uuid(),
});

export const GetAdvanceEmployeeSummarySchema = BaseSchema.extend({
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  employeeIds: z.array(z.uuid()).optional(),
});

export type CreateAdvanceEmployeeDto = z.infer<typeof CreateAdvanceEmployeeSchema>;
export type UpdateAdvanceEmployeeDto = z.infer<typeof UpdateAdvanceEmployeeSchema>;
export type AdvanceEmployeeQueryDto = z.infer<typeof AdvanceEmployeeQuerySchema>;
export type AdvanceEmployeeParamsDto = z.infer<typeof AdvanceEmployeeParamsSchema>;
export type GetAdvanceEmployeeSummaryDto = z.infer<typeof GetAdvanceEmployeeSummarySchema>;
