import { BaseSchema } from "@/shared/base/BaseSchema";
import { InvoiceTypeEnum } from "@/shared/constants/constance";
import { z } from "zod";

export const CreateInvoiceSchema = z.object({
  orderId: z.uuid().nullable().optional(),
  customerId: z.uuid().nullable().optional(),
  branchId: z.uuid().nullable().optional(),
  employeeId: z.uuid().nullable().optional(),
  timeAt: z.coerce.date(),
  code: z.string(),
  type: z.enum(InvoiceTypeEnum),
  description: z.string(),
  totalBeforeTax: z.number(),
  taxPercent: z.number(),
  taxAmount: z.number(),
  totalAfterTax: z.number(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const UpdateInvoiceSchema = z.object({
  orderId: z.uuid().nullable().optional(),
  customerId: z.uuid().nullable().optional(),
  branchId: z.uuid().nullable().optional(),
  employeeId: z.uuid().nullable().optional(),
  timeAt: z.coerce.date().optional(),
  code: z.string().optional(),
  type: z.enum(InvoiceTypeEnum).optional(),
  description: z.string().optional(),
  totalBeforeTax: z.number().optional(),
  taxPercent: z.number().optional(),
  taxAmount: z.number().optional(),
  totalAfterTax: z.number().optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const InvoiceQuerySchema = BaseSchema.extend({
  customerIds: z.array(z.uuid()).optional(),
  branchIds: z.array(z.uuid()).optional(),
  employeeIds: z.array(z.uuid()).optional(),
});

export const InvoiceParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceDto = z.infer<typeof UpdateInvoiceSchema>;
export type InvoiceQueryDto = z.infer<typeof InvoiceQuerySchema>;
export type InvoiceParamsDto = z.infer<typeof InvoiceParamsSchema>;
