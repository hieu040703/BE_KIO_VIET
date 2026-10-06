import { z } from "zod";
import { ZaloTemplateTypeEnum } from "./zalo.constance";
import dayjs from "dayjs";

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});

export const GetTemplateListSchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.coerce.number().optional(),
});

export const GetTemplateDetailSchema = z.object({
  template_id: z.coerce.number().int().positive("template_id is required"),
});

const TemplateDataSchema = z.record(z.string(), z.any());

export const SendUidMessageSchema = z.object({
  user_id: z.string().min(1, "user_id is required"),
  template_id: z.coerce.string().min(1, "template_id is required"),
  template_data: TemplateDataSchema,
  tracking_id: z.string().optional(),
});

export const GetMessageStatusSchema = z.object({
  msg_id: z.string().min(1, "msg_id is required"),
});

export const SendZaloCreateOrderMessageSchema = z.object({
  mode: z.enum(["development"]).optional(),
  name: z.string().max(30),
  phone: z.string().max(15),
  code: z.string().max(30),
  address: z.string().max(200),
  date: z.coerce.date().transform((date) => dayjs(date).tz("+7").format("HH:mm:ss DD/MM/YYYY")),
  status: z.string().max(30),
  price: z.coerce.number(),
  employee_count: z.coerce.number(),
  note: z.string().max(200),
  stringee: z.string().max(15),
});

export const SendZaloCompleteOrderMessageSchema = z.object({
  mode: z.enum(["development"]).optional(),
  customer_name: z.string().max(30),
  order_code: z.string().max(30),
  order_date: z.coerce.date().transform((date) => dayjs(date).tz("+7").format("HH:mm:ss DD/MM/YYYY")),
});

export const SendMessageSchema = z.object({
  phone: z.string(),
  templateType: z.enum(ZaloTemplateTypeEnum),
  template_id: z.coerce.string(),
  template_data: SendZaloCompleteOrderMessageSchema.or(SendZaloCreateOrderMessageSchema),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
export type GetTemplateListDto = z.infer<typeof GetTemplateListSchema>;
export type GetTemplateDetailDto = z.infer<typeof GetTemplateDetailSchema>;
export type SendZaloCreateOrderMessageDto = z.infer<typeof SendZaloCompleteOrderMessageSchema>;
export type SendUidMessageDto = z.infer<typeof SendUidMessageSchema>;
export type GetMessageStatusDto = z.infer<typeof GetMessageStatusSchema>;
export type SendMessageDto = z.infer<typeof SendMessageSchema>;
