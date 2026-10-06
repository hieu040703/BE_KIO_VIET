import { BaseSchema } from "@/shared/base/BaseSchema";
import { ExpenseApprovalStatusEnum, FinanceTypeEnum } from "@/shared/constants/constance";
import { z } from "zod";

export const CreateAdvanceSalarySchema = z.object({
  branchId: z.uuid().nullish(),
  code: z.string().optional(),
  type: z.enum([FinanceTypeEnum.ADVANCE_SALARY]),
  userId: z.uuid().optional(),
  category: z.string().default("Tạm ứng lương").optional(),
  amount: z.number(),
  employeeId: z.uuid().nullish(),
  timeAt: z.coerce.date(),
  note: z.string().nullish(),
  status: z.enum(ExpenseApprovalStatusEnum).optional(),
  tempId: z.uuid().optional(),
});

export const UpdateAdvanceSalarySchema = z.object({
  branchId: z.uuid().nullish(),
  code: z.string().optional(),
  type: z.enum([FinanceTypeEnum.ADVANCE_SALARY]).optional(),
  userId: z.uuid().optional(),
  category: z.string().default("Tạm ứng lương").optional(),
  amount: z.number().optional(),
  employeeId: z.uuid().nullish(),
  timeAt: z.coerce.date().optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const AdvanceSalaryQuerySchema = BaseSchema.extend({
  branchIds: z.array(z.uuid()).optional(),
  employeeIds: z.array(z.uuid()).optional(),
  status: z.enum(ExpenseApprovalStatusEnum).optional(),
  sortBy: z.string().default("timeAt").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC").optional(),
});

export const AdvanceSalaryParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateAdvanceSalaryDto = z.infer<typeof CreateAdvanceSalarySchema>;
export type UpdateAdvanceSalaryDto = z.infer<typeof UpdateAdvanceSalarySchema>;
export type AdvanceSalaryQueryDto = z.infer<typeof AdvanceSalaryQuerySchema>;
export type AdvanceSalaryParamsDto = z.infer<typeof AdvanceSalaryParamsSchema>;
