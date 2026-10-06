import { BaseSchema } from "@/shared/base/BaseSchema";
import { AttributeTypeEnum } from "@/shared/constants/constance";
import * as z from "zod";

export const CreateAttributeSchema = z.object({
  name: z.string(),
  code: z.string().nullish(),
  type: z.enum(AttributeTypeEnum),
  value: z.coerce.string().nullish(),
  isDefault: z.boolean().optional(),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional(),
});

export const UpdateAttributeSchema = z.object({
  name: z.string().optional(),
  code: z.string().nullish(),
  type: z.enum(AttributeTypeEnum).optional(),
  value: z.coerce.string().nullish(),
  isDefault: z.boolean().optional(),
  updatedBy: z.number().optional(),
});

export const AttributeQuerySchema = BaseSchema.extend({});

export const AttributeParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateAttributeDto = z.infer<typeof CreateAttributeSchema>;
export type UpdateAttributeDto = z.infer<typeof UpdateAttributeSchema>;
export type AttributeQueryDto = z.infer<typeof AttributeQuerySchema>;
export type AttributeParamsDto = z.infer<typeof AttributeParamsSchema>;
