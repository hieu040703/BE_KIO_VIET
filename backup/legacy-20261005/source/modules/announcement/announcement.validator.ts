import { z } from "zod/v4";
import { BaseSchema } from "@/shared/base/BaseSchema";
import { AnnouncementStatusEnum } from "@/shared/constants/constance";

export const AnnouncementQuerySchema = BaseSchema.extend({
  status: z.nativeEnum(AnnouncementStatusEnum).optional(),
});

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(500),
  content: z.string().min(1, "Nội dung không được để trống"),
});

export const UpdateAnnouncementSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(500).optional(),
  content: z.string().min(1, "Nội dung không được để trống").optional(),
});

export const AnnouncementParamsSchema = z.object({
  id: z.uuid(),
});

export type AnnouncementQueryDto = z.infer<typeof AnnouncementQuerySchema>;
export type CreateAnnouncementDto = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncementDto = z.infer<typeof UpdateAnnouncementSchema>;
export type AnnouncementParamsDto = z.infer<typeof AnnouncementParamsSchema>;
