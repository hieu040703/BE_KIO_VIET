import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
import {
  EmployeeTicketStatusEnum,
  EmployeeTicketTypeEnum,
} from "@/shared/constants/constance";

const AttachmentSchema = z
  .object({
    uid: z.string().optional(),
    name: z.string().max(255).optional(),
    originalName: z.string().max(255).optional(),
    url: z.string().max(1024).optional(),
    thumbnailUrl: z.string().max(1024).nullable().optional(),
    mimeType: z.string().max(255).nullable().optional(),
    type: z.string().max(255).nullable().optional(),
    category: z.string().max(255).nullable().optional(),
    size: z.number().int().nonnegative().nullable().optional(),
  })
  .passthrough();

export const CreateEmployeeTicketSchema = z.object({
  type: z.enum(EmployeeTicketTypeEnum),
  priority: z.number().int().min(1).max(5).default(3),
  issue: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(20_000),
  attachments: z.array(AttachmentSchema).max(10).optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const UpdateEmployeeTicketStatusSchema = z.object({
  status: z.enum(EmployeeTicketStatusEnum),
});

export const EmployeeTicketQuerySchema = BaseSchema.extend({
  status: z.enum(EmployeeTicketStatusEnum).optional(),
  type: z.enum(EmployeeTicketTypeEnum).optional(),
});

export const EmployeeTicketParamsSchema = z.object({
  id: z.uuid(),
});

export const CreateEmployeeTicketReplySchema = z.object({
  content: z.string().trim().min(1).max(20_000),
  attachments: z.array(AttachmentSchema).max(10).optional(),
  note: z.string().nullish(),
  tempId: z.uuid().optional(),
});

export const EmployeeTicketReplyQuerySchema = BaseSchema.extend({});

export const EmployeeTicketReplyParamsSchema = z.object({
  id: z.uuid(),
});

export const EmployeeTicketParticipantQuerySchema = BaseSchema.extend({});

export const AddEmployeeTicketParticipantsSchema = z.object({
  userIds: z.array(z.uuid()).min(1).max(50),
});

export const EmployeeTicketParticipantUserParamsSchema = z.object({
  userId: z.uuid(),
});

export type CreateEmployeeTicketDto = z.infer<typeof CreateEmployeeTicketSchema>;
export type UpdateEmployeeTicketStatusDto = z.infer<typeof UpdateEmployeeTicketStatusSchema>;
export type EmployeeTicketQueryDto = z.infer<typeof EmployeeTicketQuerySchema>;
export type EmployeeTicketParamsDto = z.infer<typeof EmployeeTicketParamsSchema>;
export type CreateEmployeeTicketReplyDto = z.infer<typeof CreateEmployeeTicketReplySchema>;
export type EmployeeTicketReplyQueryDto = z.infer<typeof EmployeeTicketReplyQuerySchema>;
export type EmployeeTicketParticipantQueryDto = z.infer<typeof EmployeeTicketParticipantQuerySchema>;
export type AddEmployeeTicketParticipantsDto = z.infer<typeof AddEmployeeTicketParticipantsSchema>;
