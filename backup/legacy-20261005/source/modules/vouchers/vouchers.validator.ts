import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";

export const CreateVouchersSchema = z.object({
  userId: z.uuid().optional(),
  customerId: z.uuid().optional(),
  vouchersTemplateId: z.uuid(),
  redeemedAt: z.coerce.date().optional(),
  expiredAt: z.coerce.date().optional(),
  isUsed: z.boolean().optional(),
  usedAt: z.coerce.date().nullish(),
  note: z.string().nullish(),
});

export const RedeemVoucherSchema = z.object({
  vouchersTemplateId: z.uuid(),
  note: z.string().nullish(),
});

export const UpdateVouchersSchema = z.object({
  userId: z.uuid().optional(),
  customerId: z.uuid().optional(),
  vouchersTemplateId: z.uuid().optional(),
  redeemedAt: z.coerce.date().optional(),
  expiredAt: z.coerce.date().optional(),
  isUsed: z.boolean().optional(),
  usedAt: z.coerce.date().nullish(),
  note: z.string().nullish(),
});

export const VouchersQuerySchema = BaseSchema.extend({
  customerId: z.uuid().optional(),
  userId: z.uuid().optional(),
  isUsed: z.coerce.boolean().optional(),
});

export const VouchersParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateVouchersDto = z.infer<typeof CreateVouchersSchema>;
export type RedeemVoucherDto = z.infer<typeof RedeemVoucherSchema>;
export type UpdateVouchersDto = z.infer<typeof UpdateVouchersSchema>;
