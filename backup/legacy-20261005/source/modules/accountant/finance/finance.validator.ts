import { BaseSchema } from "@/shared/base/BaseSchema";
import { ExpenseApprovalStatusEnum, FinanceTypeEnum } from "@/shared/constants/constance";
import { z } from "zod";

export const CreateFinanceSchema = z.object({
  code: z.string().optional(),
  branchId: z.uuid().nullish(),
  type: z.enum([FinanceTypeEnum.INCOME, FinanceTypeEnum.EXPENSE, FinanceTypeEnum.SALARY]),
  userId: z.uuid().optional(),
  category: z.string(),
  amount: z.number(),
  customerId: z.uuid().nullish(),
  orderId: z.uuid().nullish(),
  orderPayments: z
    .array(
      z.object({
        orderId: z.uuid(),
        amount: z.number(),
      }),
    )
    .optional(),
  timeAt: z.coerce.date(),
  isDeposit: z.boolean().optional(),
  isDebtRelated: z.boolean().optional(),
  status: z.enum(ExpenseApprovalStatusEnum).optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
  timeKeepingConfirmId: z.uuid().optional(),
  expenseApprovalId: z.uuid().optional(),
  employeeId: z.string().optional(),
});

export const UpdateFinanceSchema = z.object({
  branchId: z.uuid().nullish(),
  code: z.string().optional(),
  type: z.enum([FinanceTypeEnum.INCOME, FinanceTypeEnum.EXPENSE, FinanceTypeEnum.SALARY]).optional(),
  userId: z.uuid().optional(),
  category: z.string().optional(),
  amount: z.number().optional(),
  customerId: z.uuid().nullish(),
  orderId: z.uuid().nullish(),
  timeAt: z.coerce.date().optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const FinanceQuerySchema = BaseSchema.extend({
  branchIds: z.array(z.uuid()).optional(),
  customerIds: z.array(z.uuid()).optional(),
  categoryIds: z.array(z.uuid()).optional(),
  employeeIds: z.array(z.string()).optional(),
  type: z.enum([FinanceTypeEnum.INCOME, FinanceTypeEnum.EXPENSE, FinanceTypeEnum.SALARY]).optional(),
  excludeSalary: z
    .preprocess(
      (value) => (value === "true" ? true : value === "false" ? false : value),
      z.boolean().optional(),
    )
    .optional(),
  status: z.enum(ExpenseApprovalStatusEnum).optional(),
  sortBy: z.string().default("timeAt").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC").optional(),
});

export const FinanceParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateFinanceDto = z.infer<typeof CreateFinanceSchema>;
export type UpdateFinanceDto = z.infer<typeof UpdateFinanceSchema>;
export type FinanceQueryDto = z.infer<typeof FinanceQuerySchema>;
export type FinanceParamsDto = z.infer<typeof FinanceParamsSchema>;
