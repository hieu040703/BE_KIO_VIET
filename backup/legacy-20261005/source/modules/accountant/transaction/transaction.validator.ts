import { BaseSchema } from "@/shared/base/BaseSchema";
import { TransactionTypeEnum } from "@/shared/constants/constance";
import { z } from "zod";

export const CreateTransactionSchema = z.object({
  code: z.string().optional(),
  financeId: z.uuid(),
  type: z.enum(TransactionTypeEnum),
  amount: z.number(),
  timeAt: z.coerce.date(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const UpdateTransactionSchema = z.object({
  code: z.string().optional(),
  financeId: z.uuid().optional(),
  type: z.enum(TransactionTypeEnum).optional(),
  amount: z.number().optional(),
  timeAt: z.coerce.date().optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const TransactionQuerySchema = BaseSchema.extend({});

export const TransactionParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
export type TransactionQueryDto = z.infer<typeof TransactionQuerySchema>;
export type TransactionParamsDto = z.infer<typeof TransactionParamsSchema>;
