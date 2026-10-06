import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
import { VouchersTemplateStatusEnum } from "@/shared/constants/constance";

export const CreateVouchersTemplateSchema = z.object({
  name: z.string().trim().min(1).max(255),
  code: z.string().trim().min(1).max(50),
  points: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  status: z.enum(VouchersTemplateStatusEnum).optional(),
  note: z.string().nullish(),
});

export const UpdateVouchersTemplateSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  code: z.string().trim().min(1).max(50).optional(),
  points: z.coerce.number().int().positive().optional(),
  amount: z.coerce.number().positive().optional(),
  status: z.enum(VouchersTemplateStatusEnum).optional(),
  note: z.string().nullish(),
});

export const VouchersTemplateQuerySchema = BaseSchema.extend({
  status: z.enum(VouchersTemplateStatusEnum).optional(),
});

export const VouchersTemplateParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateVouchersTemplateDto = z.infer<typeof CreateVouchersTemplateSchema>;
export type UpdateVouchersTemplateDto = z.infer<typeof UpdateVouchersTemplateSchema>;
