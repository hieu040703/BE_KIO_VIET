import { z } from "zod";
import { FinanceTypeEnum } from "@/shared/constants/constance";
export const CreateExpenseApprovalSchema = z.object({
  timeAt: z.coerce.date(),
  requestedBy: z.string(),
  approvedBy: z.string().nullable().optional(),
  approvedAt: z.coerce.date().nullable().optional(),
  isConfirm: z.boolean(),
  amount: z.number(),
  note: z.string().nullish(),
});
export const UpdateExpenseApprovalSchema = z.object({
  timeAt: z.coerce.date().optional(),
  requestedBy: z.string().optional(),
  approvedBy: z.string().nullable().optional(),
  approvedAt: z.coerce.date().nullable().optional(),
  isConfirm: z.boolean().optional(),
  amount: z.number().optional(),
  note: z.string().nullish(),
});

export const ExpenseApprovalQuerySchema = z.object({
  direction: z.enum([FinanceTypeEnum.INCOME, FinanceTypeEnum.EXPENSE]).default(FinanceTypeEnum.EXPENSE),
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .optional(),
  size: z
    .string()
    .transform((val) => parseInt(val) || 20)
    .optional(),
  keyword: z.string().optional(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  sortBy: z.string().default("id").optional(),
  sortOrder: z
    .string()
    .transform((val) => {
      if (val.toLowerCase() === "desc") return "DESC";
      return "ASC";
    })
    .optional(),
});

export const ExpenseApprovalParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateExpenseApprovalDto = z.infer<typeof CreateExpenseApprovalSchema>;
export type UpdateExpenseApprovalDto = z.infer<typeof UpdateExpenseApprovalSchema>;
export type ExpenseApprovalQueryDto = z.infer<typeof ExpenseApprovalQuerySchema>;
export type ExpenseApprovalParamsDto = z.infer<typeof ExpenseApprovalParamsSchema>;

export const CreateExpenseApprovalRequestSchema = z.object({
  direction: z.enum([FinanceTypeEnum.INCOME, FinanceTypeEnum.EXPENSE]).default(FinanceTypeEnum.EXPENSE),
  incomeIds: z.array(z.uuid()).default([]),
  salaryIds: z.array(z.uuid()).default([]),
  expenseIds: z.array(z.uuid()).default([]),
  advanceEmployeeIds: z.array(z.uuid()).default([]),
  advanceSalaryIds: z.array(z.uuid()).default([]),
  marginIds: z.array(z.uuid()).default([]),
});
export type CreateExpenseApprovalRequestDto = z.infer<typeof CreateExpenseApprovalRequestSchema>;
