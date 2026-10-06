import { DebtQuerySchema } from "@/modules/accountant/debt/debt.validator";
import z from "zod";

export const DataDebtSchema = z.object({
  timeAt: z.date().or(z.string()).nullable(),
  orderCode: z.string().nullable(),
  content: z.string().nullable().optional(),
  amount: z.number().nullable(),
  payment: z.number().nullable(),
  remainingDebt: z.number().nullable(),
  address: z.string().nullable().optional(),
  customRowStyle: z.any().optional(),
});

export type DataDebtDto = z.infer<typeof DataDebtSchema>;

export const CustomerDebtExportSchema = z
  .object({
    customerId: z.uuid(),
  })
  .extend(DebtQuerySchema.shape);

export type CustomerDebtExportDto = z.infer<typeof CustomerDebtExportSchema>;
