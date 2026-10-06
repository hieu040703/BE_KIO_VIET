import { BaseSchema } from "@/shared/base/BaseSchema";
import { DebtTypeEnum } from "@/shared/constants/constance";
import { z } from "zod";

export const CreateDebtSchema = z.object({
  code: z.string().optional(),
  type: z.enum(DebtTypeEnum),
  amount: z.number(),
  customerId: z.uuid(),
  orderId: z.uuid(),
  financeId: z.uuid().nullish(),
  timeAt: z.coerce.date(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const UpdateDebtSchema = z.object({
  code: z.string().optional(),
  type: z.enum(DebtTypeEnum).optional(),
  amount: z.number().optional(),
  customerId: z.uuid().nullish(),
  orderId: z.uuid().nullish(),
  financeId: z.uuid().nullish(),
  timeAt: z.coerce.date().optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const DebtQuerySchema = BaseSchema.extend({});

export const DebtParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateDebtDto = z.infer<typeof CreateDebtSchema>;
export type UpdateDebtDto = z.infer<typeof UpdateDebtSchema>;
export type DebtQueryDto = z.infer<typeof DebtQuerySchema>;
export type DebtParamsDto = z.infer<typeof DebtParamsSchema>;
