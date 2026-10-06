import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";

export const CreateServicePriceSchema = z.object({
  serviceId: z.string(),
  category: z.string(),
  unit: z.string(),
  quantity: z.number(),
  price: z.number(),
  excessUnitPrice: z.number(),
  note: z.string().nullish(),
});

export const UpdateServicePriceSchema = z.object({
  serviceId: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
  excessUnitPrice: z.number().optional(),
  note: z.string().nullish(),
});

export const ServicePriceQuerySchema = BaseSchema.extend({});

export const ServicePriceParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateServicePriceDto = z.infer<typeof CreateServicePriceSchema>;
export type UpdateServicePriceDto = z.infer<typeof UpdateServicePriceSchema>;
export type ServicePriceQueryDto = z.infer<typeof ServicePriceQuerySchema>;
export type ServicePriceParamsDto = z.infer<typeof ServicePriceParamsSchema>;
