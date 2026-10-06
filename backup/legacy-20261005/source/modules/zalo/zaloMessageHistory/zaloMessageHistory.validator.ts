import { BaseSchema } from "@/shared/base/BaseSchema";
import { z } from "zod";
import { ZaloMessageStatusEnum, ZaloTemplateTypeEnum } from "../zalo.constance";

export const ZaloMessageHistoryQuerySchema = BaseSchema.extend({
  customerId: z.uuid().optional(),
  driverId: z.uuid().optional(),
  tripId: z.uuid().optional(),
  status: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "all") return undefined;
      return val as ZaloMessageStatusEnum;
    }),
  templateType: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "all") return undefined;
      return val as ZaloTemplateTypeEnum;
    }),
  phone: z.string().optional(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  sortBy: z.string().default("sentAt").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC").optional(),
});

export const ZaloMessageHistoryParamsSchema = z.object({
  id: z.uuid(),
});

export const ResendZaloMessageHistorySchema = z.object({});

export type ZaloMessageHistoryQueryDto = z.infer<typeof ZaloMessageHistoryQuerySchema>;
export type ZaloMessageHistoryParamsDto = z.infer<typeof ZaloMessageHistoryParamsSchema>;
export type ResendZaloMessageHistoryDto = z.infer<typeof ResendZaloMessageHistorySchema>;
