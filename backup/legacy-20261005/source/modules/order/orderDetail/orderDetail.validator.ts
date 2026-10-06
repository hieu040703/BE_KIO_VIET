import { BaseSchema } from "@/shared/base/BaseSchema";
import { z } from "zod";

export const CreateOrderDetailSchema = z.object({
  orderId: z.uuid(),
  name: z.string(),
  unit: z.string().max(100),
  quantity: z.number(),
  price: z.number(),
  totalHours: z.number().nullish(),
  amount: z.number(),
  note: z.string().nullish(),
});

// Schema for creating order detail from nested route (orderId in params)
export const CreateOrderDetailBodySchema = z.object({
  name: z.string(),
  unit: z.string().max(100),
  quantity: z.number(),
  price: z.number(),
  amount: z.number(),
  totalHours: z.number().nullish(),
  note: z.string().nullish(),
});

// Schema for validating orderId in params
export const OrderIdParamsSchema = z.object({
  orderId: z.uuid(),
});

export const UpdateOrderDetailSchema = z.object({
  name: z.string().optional(),
  orderId: z.uuid().optional(),
  unit: z.string().max(100).optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
  amount: z.number().optional(),
  totalHours: z.number().nullish(),
  note: z.string().nullish(),
});

export const OrderDetailQuerySchema = BaseSchema.extend({});

export const OrderDetailParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateOrderDetailDto = z.infer<typeof CreateOrderDetailSchema>;
export type UpdateOrderDetailDto = z.infer<typeof UpdateOrderDetailSchema>;
export type OrderDetailQueryDto = z.infer<typeof OrderDetailQuerySchema>;
export type OrderDetailParamsDto = z.infer<typeof OrderDetailParamsSchema>;
