import { BaseSchema } from "@/shared/base/BaseSchema";
import z from "zod";

export const GetAllExpensesQuerySchema = BaseSchema.extend({});
export const ConfirmExpenseBodySchema = z.object({
  salaryIds: z.array(z.uuid()).default([]),
  expenseIds: z.array(z.uuid()).default([]),
  advanceEmployeeIds: z.array(z.uuid()).default([]),
  advanceSalaryIds: z.array(z.uuid()).default([]),
  marginIds: z.array(z.uuid()).default([]),
});
export type ConfirmExpenseBodyDto = z.infer<typeof ConfirmExpenseBodySchema>;

export type GetAllExpensesQueryDto = z.infer<typeof GetAllExpensesQuerySchema>;
