import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
import { CallHistoryTypeEnum } from "@/shared/constants/constance";

export const CreateCallHistorySchema = z.object({
  startTime: z.coerce.date(),
  endTime: z.coerce.date().nullable().optional(),
  duration: z.number().nullable().optional(),
  answerDuration: z.number().nullable().optional(),
  endCallCause: z.string().nullable().optional(),
  endedBy: z.string().nullable().optional(),
  callType: z.enum(CallHistoryTypeEnum),
  callerPhoneNumber: z.string().nullable().optional(),
  receiverPhoneNumber: z.string().nullable().optional(),
  callerId: z.uuid().nullable().optional(),
  receiverId: z.uuid().nullable().optional(),
  orderId: z.uuid().nullable().optional(),
  callId: z.string(),
  recordingUrl: z.string().nullable().optional(),
  note: z.string().nullish(),
});

export const UpdateCallHistorySchema = z.object({
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().nullable().optional(),
  duration: z.number().nullable().optional(),
  answerDuration: z.number().nullable().optional(),
  endCallCause: z.string().nullable().optional(),
  endedBy: z.string().nullable().optional(),
  callType: z.enum(CallHistoryTypeEnum).optional(),
  callerPhoneNumber: z.string().nullable().optional(),
  receiverPhoneNumber: z.string().nullable().optional(),
  callerId: z.string().optional(),
  receiverId: z.string().optional(),
  orderId: z.uuid().nullable().optional(),
  callId: z.string().optional(),
  recordingUrl: z.string().nullable().optional(),
  note: z.string().nullish(),
});

export const CallHistoryQuerySchema = BaseSchema.extend({
  orderId: z.uuid().optional(),
});

export const CallHistoryParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateCallHistoryDto = z.infer<typeof CreateCallHistorySchema>;
export type UpdateCallHistoryDto = z.infer<typeof UpdateCallHistorySchema>;
export type CallHistoryQueryDto = z.infer<typeof CallHistoryQuerySchema>;
export type CallHistoryParamsDto = z.infer<typeof CallHistoryParamsSchema>;
