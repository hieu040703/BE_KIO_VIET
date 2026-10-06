import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
import { TicketTypeEnum } from "@/shared/constants/constance";

export const CreateTicketSchema = z.object({
  customerId: z.string().optional(),
  serviceOrderId: z.string().nullable().optional(),
  type: z.enum(TicketTypeEnum),
  priority: z.number(),
  issue: z.string().max(255),
  description: z.string(),
  contactPhone: z.string().max(20),
  preferredTime: z.string().max(255).nullable().optional(),
  status: z.string().optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const UpdateTicketSchema = z.object({
  customerId: z.string().optional(),
  serviceOrderId: z.string().nullable().optional(),
  type: z.enum(TicketTypeEnum).optional(),
  priority: z.number().optional(),
  issue: z.string().max(255).optional(),
  description: z.string().optional(),
  contactPhone: z.string().max(20).optional(),
  preferredTime: z.string().max(255).nullable().optional(),
  status: z.string().optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const TicketQuerySchema = BaseSchema.extend({
  status: z.string().optional(),
});

export const TicketParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateTicketDto = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketDto = z.infer<typeof UpdateTicketSchema>;
export type TicketQueryDto = z.infer<typeof TicketQuerySchema>;
export type TicketParamsDto = z.infer<typeof TicketParamsSchema>;
