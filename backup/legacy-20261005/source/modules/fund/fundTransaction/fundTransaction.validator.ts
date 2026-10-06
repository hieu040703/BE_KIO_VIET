import { BaseSchema } from "@/shared/base/BaseSchema";
import { z } from "zod";
export const CreateFundTransactionSchema = z.object({
  code: z.string(),
  fundId: z.uuid(),
  amount: z.number(),
  transactionAccountNumber: z.string().nullable().optional(),
  transactionCode: z.string().nullable().optional(),
  referenceCode: z.string().nullable().optional(),
  transferType: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  timeAt: z.coerce.date(),
  note: z.string().nullish(),
});
export const UpdateFundTransactionSchema = z.object({
  code: z.string().optional(),
  fundId: z.uuid().optional(),
  amount: z.number().optional(),
  transactionAccountNumber: z.string().nullable().optional(),
  transactionCode: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  timeAt: z.coerce.date().optional(),
  note: z.string().nullish(),
});

export const FundTransactionQuerySchema = BaseSchema.extend({});

export const FundTransactionParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateFundTransactionDto = z.infer<typeof CreateFundTransactionSchema>;
export type UpdateFundTransactionDto = z.infer<typeof UpdateFundTransactionSchema>;
export type FundTransactionQueryDto = z.infer<typeof FundTransactionQuerySchema>;
export type FundTransactionParamsDto = z.infer<typeof FundTransactionParamsSchema>;
