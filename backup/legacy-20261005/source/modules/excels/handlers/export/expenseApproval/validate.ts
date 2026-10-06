import z from "zod";

export const DataExpenseApprovalSchema = z.object({
  timeAt: z.date().nullable(),
  code: z.string(),
  branchName: z.string().optional(),
  employeeName: z.string().optional(),
  amount: z.number(),
  description: z.string().optional(),
  type: z.string().optional(),
  customRowStyle: z.any().optional(),
});

export type DataExpenseApprovalDto = z.infer<typeof DataExpenseApprovalSchema>;
