import { BaseSchema } from "@/shared/base/BaseSchema";
import { z } from "zod";

export const CreateFundSchema = z.object({
  name: z.string(),
  bankName: z.string(),
  bin: z.string().nullable().optional(),
  accountNumber: z.string(),
  accountHolder: z.string(),
  branch: z.string().nullable().optional(),
  isDefault: z.boolean(),
  note: z.string().nullish(),
});

export const UpdateFundSchema = z.object({
  name: z.string().optional(),
  bankName: z.string().optional(),
  bin: z.string().nullable().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
  branch: z.string().nullable().optional(),
  isDefault: z.boolean().optional(),
  note: z.string().nullish(),
});

export const FundQuerySchema = BaseSchema.extend({});

export const FundParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateFundDto = z.infer<typeof CreateFundSchema>;
export type UpdateFundDto = z.infer<typeof UpdateFundSchema>;
export type FundQueryDto = z.infer<typeof FundQuerySchema>;
export type FundParamsDto = z.infer<typeof FundParamsSchema>;
