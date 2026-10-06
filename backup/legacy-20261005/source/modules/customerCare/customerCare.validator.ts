import { z } from "zod";
import {
  CustomerCareMethod,
  CustomerCareStatus,
} from "@/database/models/CustomerCare";
import { BaseSchema } from "@/shared/base/BaseSchema";

export const CreateCustomerCareSchema = z.object({
  customerId: z.uuid(),
  employeeId: z.uuid(),
  method: z.enum(CustomerCareMethod),
  status: z.enum(CustomerCareStatus),
  scheduledAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable().optional(),
  nextFollowUpAt: z.coerce.date().nullable().optional(),
  note: z.string().nullish(),
});

export const UpdateCustomerCareSchema = z.object({
  customerId: z.uuid().optional(),
  employeeId: z.uuid().optional(),
  method: z.enum(CustomerCareMethod).optional(),
  status: z.enum(CustomerCareStatus).optional(),
  scheduledAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().nullable().optional(),
  nextFollowUpAt: z.coerce.date().nullable().optional(),
  note: z.string().nullish(),
});

export const CustomerCareQuerySchema = BaseSchema.extend({
  customerId: z.uuid(),
});

export const CustomerCareParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateCustomerCareDto = z.infer<typeof CreateCustomerCareSchema>;
export type UpdateCustomerCareDto = z.infer<typeof UpdateCustomerCareSchema>;
export type CustomerCareQueryDto = z.infer<typeof CustomerCareQuerySchema>;
export type CustomerCareParamsDto = z.infer<typeof CustomerCareParamsSchema>;
