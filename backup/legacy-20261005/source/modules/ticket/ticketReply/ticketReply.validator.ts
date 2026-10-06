import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
const TicketReplyAttachmentSchema = z
  .object({
    uid: z.string().optional(),
    name: z.string().optional(),
    originalName: z.string().optional(),
    url: z.string().optional(),
    thumbnailUrl: z.string().nullable().optional(),
    mimeType: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    size: z.number().nullable().optional(),
  })
  .passthrough();

export const CreateTicketReplySchema = z.object({
  userId: z.string(),
  ticketId: z.string().optional(),
  content: z.string(),
  type: z.string(),
  attachments: z.array(TicketReplyAttachmentSchema).optional(),
  isInternal: z.boolean(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const UpdateTicketReplySchema = z.object({
  userId: z.string().optional(),
  ticketId: z.string().optional(),
  content: z.string().optional(),
  type: z.string().optional(),
  attachments: z.array(TicketReplyAttachmentSchema).optional(),
  isInternal: z.boolean().optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const TicketReplyQuerySchema = BaseSchema.extend({
  ticketId: z.uuid().optional(),
});

export const TicketReplyParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateTicketReplyDto = z.infer<typeof CreateTicketReplySchema>;
export type UpdateTicketReplyDto = z.infer<typeof UpdateTicketReplySchema>;
export type TicketReplyQueryDto = z.infer<typeof TicketReplyQuerySchema>;
export type TicketReplyParamsDto = z.infer<typeof TicketReplyParamsSchema>;
