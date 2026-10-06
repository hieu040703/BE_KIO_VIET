import { DebtQuerySchema } from "@/modules/accountant/debt/debt.validator";
import z from "zod";

export const DataEmployeeHrSchema = z.object({
  index: z.number(),
  employeeName: z.string(),
  employeeCode: z.string(),
  branchName: z.string().nullable(),
  recruitmentQuantity: z.number(),
});

export type DataEmployeeHrDto = z.infer<typeof DataEmployeeHrSchema>;
