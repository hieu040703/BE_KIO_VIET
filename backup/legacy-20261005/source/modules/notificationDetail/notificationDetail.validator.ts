import { BaseSchema } from "@/shared/base/BaseSchema";
import { z } from "zod";

export const CreateNotificationDetailSchema = z.object({
  userId: z.uuid(),
  notificationId: z.uuid(),
  isRead: z.boolean().default(false).optional(),
});

export const UpdateNotificationDetailSchema = z.object({
  userId: z.uuid().optional(),
  notificationId: z.uuid().optional(),
  isRead: z.boolean().optional(),
});

export const NotificationDetailQuerySchema = BaseSchema.extend({});

export const NotificationDetailParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateNotificationDetailDto = z.infer<typeof CreateNotificationDetailSchema>;
export type UpdateNotificationDetailDto = z.infer<typeof UpdateNotificationDetailSchema>;
export type NotificationDetailQueryDto = z.infer<typeof NotificationDetailQuerySchema>;
export type NotificationDetailParamsDto = z.infer<typeof NotificationDetailParamsSchema>;
