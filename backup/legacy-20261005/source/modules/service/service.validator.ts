import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
import { ServiceOrderTypeEnum } from "@/shared/constants/constance";
import { CreateServicePriceSchema } from "./servicePrice/servicePrice.validator";

export const CreateServiceSchema = z.object({
  name: z.string(),
  type: z.enum(ServiceOrderTypeEnum),
  autoQuote: z.boolean().optional().default(false),
  icon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  note: z.string().nullish(),
  prices: z.array(CreateServicePriceSchema.omit({ serviceId: true })).optional(),
});

export const UpdateServiceSchema = z.object({
  name: z.string().optional(),
  type: z.enum(ServiceOrderTypeEnum).optional(),
  autoQuote: z.boolean().optional(),
  icon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  note: z.string().nullish(),
  prices: z.array(CreateServicePriceSchema.omit({ serviceId: true })).optional(),
});

export const ServiceQuerySchema = BaseSchema.extend({
  sortBy: z.string().default("createdAt").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("ASC").optional(),
});

export const ServiceParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateServiceDto = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceDto = z.infer<typeof UpdateServiceSchema>;
export type ServiceQueryDto = z.infer<typeof ServiceQuerySchema>;
export type ServiceParamsDto = z.infer<typeof ServiceParamsSchema>;
