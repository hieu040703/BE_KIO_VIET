import { BaseSchema } from "@/shared/base/BaseSchema";
import { z } from "zod";

const arrayOrNull = (schema: z.ZodArray<any>) =>
  z.preprocess((value) => {
    if (value === "" || value === "[]" || value === null || value === undefined) {
      return null;
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }

    return value;
  }, schema.nullable());

export const CreateOrderLeaderChatSchema = z
  .object({
    tempId: z.uuid().optional(),
    orderId: z.uuid().optional(),
    replyMessageId: z.uuid().nullish(),
    content: z.string().trim().nullish(),
    attachments: arrayOrNull(z.array(z.any())).optional(),
    tags: arrayOrNull(z.array(z.uuid())).optional(),
  })
  .superRefine((data, context) => {
    const hasContent = Boolean(data.content && data.content.trim().length > 0);
    const hasAttachments = Array.isArray(data.attachments) && data.attachments.length > 0;

    if (!hasContent && !hasAttachments) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "content_or_attachments_required",
        path: ["content"],
      });
    }
  });

export const UpdateOrderLeaderChatSchema = z.object({
  replyMessageId: z.uuid().nullish(),
  content: z.string().trim().nullish(),
  attachments: arrayOrNull(z.array(z.any())).optional(),
  tags: arrayOrNull(z.array(z.uuid())).optional(),
});

export const OrderLeaderChatQuerySchema = BaseSchema.extend({
  beforeMessageId: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
});

export const OrderLeaderChatParamsSchema = z.object({
  id: z.uuid(),
});

export const OrderLeaderChatReadSchema = z.object({
  messageId: z.uuid(),
});

export type CreateOrderLeaderChatDto = z.infer<typeof CreateOrderLeaderChatSchema>;
export type UpdateOrderLeaderChatDto = z.infer<typeof UpdateOrderLeaderChatSchema>;
export type OrderLeaderChatQueryDto = z.infer<typeof OrderLeaderChatQuerySchema>;
export type OrderLeaderChatParamsDto = z.infer<typeof OrderLeaderChatParamsSchema>;
export type OrderLeaderChatReadDto = z.infer<typeof OrderLeaderChatReadSchema>;
