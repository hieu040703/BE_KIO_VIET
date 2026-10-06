import { DebtQuerySchema } from "@/modules/accountant/debt/debt.validator";
import { FinanceQuerySchema } from "@/modules/accountant/finance/finance.validator";
import z from "zod";

export const DataFinanceSchema = z.object({
  index: z.number(),
  timeAt: z.date(),
  code: z.string(),
  amount: z.number(),
  note: z.string().optional(),
  category: z.string().optional(),
  employeeName: z.string().optional(),
  branchName: z.string().optional(),
  customerName: z.string().optional(),
  contractNumber: z.string().optional(),
});

export type DataFinanceDto = z.infer<typeof DataFinanceSchema>;

export const ExportFinanceSchema = FinanceQuerySchema;

export type ExportFinanceDto = z.infer<typeof ExportFinanceSchema>;
