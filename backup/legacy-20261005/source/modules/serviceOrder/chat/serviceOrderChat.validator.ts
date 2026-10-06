import { BaseSchema } from "@/shared/base/BaseSchema";
import { ServiceOrderChatMessageTypeEnum } from "@/shared/constants/constance";
import { z } from "zod";

const arrayOrNull = (schema: z.ZodArray<any>) =>
  z.preprocess((val) => {
    if (val === "" || val === "[]" || val === null || val === undefined) {
      return null;
    }

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

export const ServiceOrderChatParamsSchema = z.object({
  serviceOrderId: z.uuid(),
});

export const ServiceOrderChatMessageQuerySchema = BaseSchema.extend({
  page: z.coerce.number().min(1).optional().default(1),
  size: z.coerce.number().min(1).max(100).optional().default(20),
  sortOrder: z.enum(["ASC", "DESC"]).optional().default("DESC"),
});

export const CreateServiceOrderChatMessageSchema = z
  .object({
    content: z.string().trim().nullish(),
    attachments: arrayOrNull(z.array(z.any())).optional(),
    metadata: z.record(z.string(), z.any()).nullish(),
    tags: arrayOrNull(z.array(z.uuid())).optional(),
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

export const AddChatParticipantSchema = z.object({
  userId: z.uuid(),
});

export const RemoveChatParticipantSchema = z.object({
  targetUserId: z.uuid(),
});

export type ServiceOrderChatParamsDto = z.infer<typeof ServiceOrderChatParamsSchema>;
export type ServiceOrderChatMessageQueryDto = z.infer<typeof ServiceOrderChatMessageQuerySchema>;
export type CreateServiceOrderChatMessageDto = z.infer<typeof CreateServiceOrderChatMessageSchema>;
export type AddChatParticipantDto = z.infer<typeof AddChatParticipantSchema>;
export type RemoveChatParticipantDto = z.infer<typeof RemoveChatParticipantSchema>;

export type CreateServiceOrderChatMessageInternalDto = {
  serviceOrderId: string;
  senderUserId: string | null;
  messageType: ServiceOrderChatMessageTypeEnum;
  content: string | null;
  attachments: any[] | null;
  metadata?: Record<string, any> | null;
  tags?: string[] | null;
  timeAt?: Date;
};
