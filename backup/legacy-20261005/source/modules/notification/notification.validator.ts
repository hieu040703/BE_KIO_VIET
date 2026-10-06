import { BaseSchema } from "@/shared/base/BaseSchema";
import { NotificationTypeEnum } from "@/shared/constants/constance";
import { z } from "zod";
import { CreateNotificationDetailSchema } from "../notificationDetail/notificationDetail.validator";

export const CreateNotificationSchema = z.object({
  title: z.string(),
  content: z.string(),
  type: z.enum(NotificationTypeEnum).default(NotificationTypeEnum.SYSTEM),
  objectId: z.uuid().optional(),
  metadata: z.any().nullish(),
  timeAt: z.coerce
    .date()
    .default(() => new Date())
    .optional(),
  details: z.array(CreateNotificationDetailSchema.omit({ notificationId: true })).optional(),
});

export const UpdateNotificationSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  type: z.enum(NotificationTypeEnum).optional(),
  metadata: z.any().nullish(),
  timeAt: z.coerce
    .date()
    .default(() => new Date())
    .optional(),
});

export const NotificationQuerySchema = BaseSchema.extend({
  isRead: z
    .string()
    .transform((val) => {
      if (val.toLowerCase() === "true") return true;
      if (val.toLowerCase() === "false") return false;
      return undefined;
    })
    .optional(),
});

export const NotificationParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateNotificationDto = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotificationDto = z.infer<typeof UpdateNotificationSchema>;
export type NotificationQueryDto = z.infer<typeof NotificationQuerySchema>;
export type NotificationParamsDto = z.infer<typeof NotificationParamsSchema>;
