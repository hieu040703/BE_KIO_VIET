import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";

export const CreateTimeKeepingConfirmSchema = z.object({
  employeeId: z.uuid(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  userId: z.uuid(),
  totalHours: z.number(),
  totalDayWorked: z.number().nullish(),
  totalSalary: z.number(),
  totalRealSalary: z.number(),
  totalAdvance: z.number().optional(),
  totalMargin: z.number().optional(),
  totalUniform: z.number().optional(),
  totalPenalty: z.number().optional(),
  totalBonus: z.number().optional(),
  timeAt: z.coerce.date(),
  note: z.string().nullish(),
});

export const UpdateTimeKeepingConfirmSchema = z.object({
  removeTimeKeepingIds: z.array(z.uuid()).optional(),
});

export const TimeKeepingConfirmQuerySchema = BaseSchema.extend({
  sortBy: z.string().default("timeAt").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC").optional(),
});

export const TimeKeepingConfirmParamsSchema = z.object({
  id: z.uuid(),
});

export const ExportTimeSheetPdfSchema = z.object({
  timeKeepingConfirmIds: z.array(z.uuid()),
});

export type CreateTimeKeepingConfirmDto = z.infer<typeof CreateTimeKeepingConfirmSchema>;
export type UpdateTimeKeepingConfirmDto = z.infer<typeof UpdateTimeKeepingConfirmSchema>;
export type TimeKeepingConfirmQueryDto = z.infer<typeof TimeKeepingConfirmQuerySchema>;
export type TimeKeepingConfirmParamsDto = z.infer<typeof TimeKeepingConfirmParamsSchema>;
export type ExportTimeSheetPdfDto = z.infer<typeof ExportTimeSheetPdfSchema>;
