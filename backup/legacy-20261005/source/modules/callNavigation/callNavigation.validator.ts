import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";

export const CreateCallNavigationSchema = z.object({
  customerId: z.string().nullable().optional(),
  employeePhone: z.string(),
  phone: z.string(),
  stringeePhone: z.string(),
  userId: z.string(),
  orderId: z.string(),
  priority: z.number(),
  callId: z.string().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  note: z.string().nullish(),
});

export const UpdateCallNavigationSchema = z.object({
  customerId: z.string().nullable().optional(),
  employeePhone: z.string().optional(),
  phone: z.string().optional(),
  stringeePhone: z.string().optional(),
  userId: z.string().optional(),
  orderId: z.string().nullable().optional(),
  priority: z.number().optional(),
  callId: z.string().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  note: z.string().nullish(),
});

export const CallNavigationQuerySchema = BaseSchema.extend({});

export const CallNavigationParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateCallNavigationDto = z.infer<typeof CreateCallNavigationSchema>;
export type UpdateCallNavigationDto = z.infer<typeof UpdateCallNavigationSchema>;
export type CallNavigationQueryDto = z.infer<typeof CallNavigationQuerySchema>;
export type CallNavigationParamsDto = z.infer<typeof CallNavigationParamsSchema>;
