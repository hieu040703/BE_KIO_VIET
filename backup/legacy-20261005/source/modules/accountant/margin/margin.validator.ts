import { MarginStatusEnum, MarginTypeEnum } from "@/shared/constants/constance";
import { BaseSchema } from "@/shared/base/BaseSchema";
import { z } from "zod";

export const CreateMarginSchema = z.object({
  branchId: z.uuid().nullish(),
  employeeId: z.uuid(),
  code: z.string().optional(),
  type: z.enum(MarginTypeEnum),
  amount: z.number(),
  userId: z.uuid().optional(),
  timeAt: z.coerce.date(),
  isAutomatic: z.boolean().default(false).optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const UpdateMarginSchema = z.object({
  branchId: z.uuid().nullish(),
  employeeId: z.uuid().optional(),
  code: z.string().optional(),
  type: z.enum(MarginTypeEnum).optional(),
  amount: z.number().optional(),
  userId: z.uuid().optional(),
  timeAt: z.coerce.date().optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const MarginQuerySchema = BaseSchema.extend({
  branchIds: z.array(z.uuid()).optional(),
  employeeIds: z.array(z.uuid()).optional(),
  status: z.enum(MarginStatusEnum).optional(),
  sortBy: z.string().default("timeAt").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC").optional(),
});

export const MarginParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateMarginDto = z.infer<typeof CreateMarginSchema>;
export type UpdateMarginDto = z.infer<typeof UpdateMarginSchema>;
export type MarginQueryDto = z.infer<typeof MarginQuerySchema>;
export type MarginParamsDto = z.infer<typeof MarginParamsSchema>;
