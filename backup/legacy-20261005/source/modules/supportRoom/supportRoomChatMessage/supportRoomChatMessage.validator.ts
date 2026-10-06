import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
import { ServiceOrderChatMessageTypeEnum } from "@/shared/constants/constance";

const arrayOrNull = (schema: z.ZodArray<any>) =>
  z.preprocess((val) => {
    if (val === "" || val === "[]" || val === null || val === undefined) return null;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return val;
  }, schema.nullable());

export const SupportRoomChatParamsSchema = z.object({
  supportRoomId: z.uuid(),
});

export const SupportRoomChatMessageQuerySchema = BaseSchema.extend({
  page: z.coerce.number().min(1).optional().default(1),
  size: z.coerce.number().min(1).max(100).optional().default(20),
  sortOrder: z.enum(["ASC", "DESC"]).optional().default("DESC"),
});

export const CreateSupportRoomChatMessageSchema = z
  .object({
    content: z.string().trim().nullish(),
    attachments: arrayOrNull(z.array(z.any())).optional(),
    metadata: z.record(z.string(), z.any()).nullish(),
    tempId: z.uuid().optional(),
  })
  .superRefine((data, ctx) => {
    const hasContent = !!data.content && data.content.trim().length > 0;
    const hasAttachments = Array.isArray(data.attachments) && data.attachments.length > 0;
    if (!hasContent && !hasAttachments) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "content_or_attachments_required",
        path: ["content"],
      });
    }
  });

export const UpdateSupportRoomChatMessageSchema = z.object({
  content: z.string().trim().optional(),
  tempId: z.uuid().optional(),
});

export const SupportRoomChatMessageParamsSchema = z.object({
  id: z.uuid(),
});

export type SupportRoomChatParamsDto = z.infer<typeof SupportRoomChatParamsSchema>;
export type SupportRoomChatMessageQueryDto = z.infer<typeof SupportRoomChatMessageQuerySchema>;
export type CreateSupportRoomChatMessageDto = z.infer<typeof CreateSupportRoomChatMessageSchema>;
export type UpdateSupportRoomChatMessageDto = z.infer<typeof UpdateSupportRoomChatMessageSchema>;
export type SupportRoomChatMessageParamsDto = z.infer<typeof SupportRoomChatMessageParamsSchema>;

export type CreateSupportRoomChatMessageInternalDto = {
  supportRoomId: string;
  senderUserId: string | null;
  messageType: ServiceOrderChatMessageTypeEnum;
  content: string | null;
  attachments: any[] | null;
  metadata?: Record<string, any> | null;
  timeAt?: Date;
};
