import { z } from "zod";

// Schema cho việc generate access token cho client SDK
export const GenerateTokenSchema = z.object({
  userId: z.string().min(1, "userId là bắt buộc"),
});

// Schema cho việc gọi từ server (make outbound call)
export const MakeCallSchema = z.object({
  from: z.string().min(1, "Số điện thoại gọi đi là bắt buộc"),
  to: z.string().min(1, "Số điện thoại nhận là bắt buộc"),
  customData: z.string().optional(),
});

// Schema cho answer_url query params (Stringee gửi GET request)
// Flow 1 (app-to-app): fromInternal=true, from=user_1, to=user_2, userId=user_1
// Flow 2 (app-to-phone): fromInternal=true, from=phone_number_1, to=phone_number_2, userId=user_id
// Flow 3 (phone-to-app): fromInternal=false, from=caller_phone, to=stringee_number, uuid=xxx
export const AnswerUrlSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  fromInternal: z.string().optional(),
  userId: z.string().optional(),
  projectId: z.string().optional(),
  callId: z.string().optional(),
  custom: z.string().optional(),
  uuid: z.string().optional(), // Flow 3: Stringee gửi uuid cho cuộc gọi từ bên ngoài
});

// Schema cho event_url body (Stringee gửi POST request)
export const EventUrlSchema = z.object({
  call_status: z.string().optional(),
  project_id: z.number().optional(),
  request_from_user_id: z.string().optional(),
  account_sid: z.string().optional(),
  timestamp_ms: z.number().optional(),
  from: z
    .object({
      number: z.string().optional(),
      alias: z.string().optional(),
      is_online: z.boolean().optional(),
      type: z.string().optional(),
    })
    .optional(),
  to: z
    .object({
      number: z.string().optional(),
      alias: z.string().optional(),
      is_online: z.boolean().optional(),
      type: z.string().optional(),
    })
    .optional(),
  type: z.string().optional(),
  call_id: z.string().optional(),
  clientCustomData: z.string().optional(),
  callCreatedReason: z.string().optional(),
  endCallCause: z.string().optional(),
  endedBy: z.string().optional(),
  callType: z.string().optional(),
  duration: z.number().optional(),
  answerDuration: z.number().optional(),
});

export type GenerateTokenDto = z.infer<typeof GenerateTokenSchema>;
export type MakeCallDto = z.infer<typeof MakeCallSchema>;
export type AnswerUrlDto = z.infer<typeof AnswerUrlSchema>;
export type EventUrlDto = z.infer<typeof EventUrlSchema>;
