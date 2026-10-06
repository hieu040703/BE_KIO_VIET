import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
import { PositionDefaultEnum } from "@/shared/constants/constance";

export const CreateOrderLeaderSchema = z.object({
  position: z.enum(PositionDefaultEnum).optional(),
  orderId: z.string().optional(),
  employeeId: z.string(),
  revenueShare: z.number(),
  isRevenueShareAllocated: z.boolean().optional(),
  allocateRevenueId: z.uuid().nullish(),
  note: z.string().nullish(),
});

export const UpdateOrderLeaderSchema = z.object({
  position: z.enum(PositionDefaultEnum).optional(),
  orderId: z.string().optional(),
  employeeId: z.string().optional(),
  revenueShare: z.number().optional(),
  isRevenueShareAllocated: z.boolean().optional(),
  allocateRevenueId: z.uuid().nullish(),
  note: z.string().nullish(),
});

export const OrderLeaderQuerySchema = BaseSchema.extend({
  orderId: z.string().optional(),
});

export const OrderLeaderParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateOrderLeaderDto = z.infer<typeof CreateOrderLeaderSchema>;
export type UpdateOrderLeaderDto = z.infer<typeof UpdateOrderLeaderSchema>;
export type OrderLeaderQueryDto = z.infer<typeof OrderLeaderQuerySchema>;
export type OrderLeaderParamsDto = z.infer<typeof OrderLeaderParamsSchema>;
