import { BaseSchema } from "@/shared/base/BaseSchema";
import { z } from "zod";
import { ZaloTemplateTypeEnum } from "../zalo.constance";

export const CreateZaloTemplateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(ZaloTemplateTypeEnum),
  templateId: z.coerce.string().min(1),
  note: z.string().nullish(),
});

export const UpdateZaloTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(ZaloTemplateTypeEnum).optional(),
  templateId: z.coerce.string().min(1).optional(),
  note: z.string().nullish(),
});

export const ZaloTemplateQuerySchema = BaseSchema.extend({
  type: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "all") return undefined;
      return val as ZaloTemplateTypeEnum;
    }),
  sortBy: z.string().default("createdAt").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC").optional(),
});

export const ZaloTemplateParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateZaloTemplateDto = z.infer<typeof CreateZaloTemplateSchema>;
export type UpdateZaloTemplateDto = z.infer<typeof UpdateZaloTemplateSchema>;
export type ZaloTemplateQueryDto = z.infer<typeof ZaloTemplateQuerySchema>;
export type ZaloTemplateParamsDto = z.infer<typeof ZaloTemplateParamsSchema>;
