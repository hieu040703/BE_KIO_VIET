import { BaseSchema } from "@/shared/base/BaseSchema";
import { z } from "zod";

// Helper để transform empty string thành empty array hoặc null
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

export const CreateOrderCommentSchema = z.object({
  tempId: z.uuid().optional(),
  orderId: z.uuid().optional(),
  userId: z.uuid().nullish(),
  content: z.string(),
  attachments: arrayOrNull(z.array(z.any())).optional(),
  tags: arrayOrNull(z.array(z.uuid())).optional(),
  note: z.string().nullish(),
});

export const UpdateOrderCommentSchema = z.object({
  orderId: z.uuid().optional(),
  userId: z.uuid().nullish(),
  content: z.string().nullish(),
  attachments: arrayOrNull(z.array(z.string())).optional(),
  tags: arrayOrNull(z.array(z.uuid())).optional(),
  note: z.string().nullish(),
});

export const OrderCommentQuerySchema = BaseSchema.extend({});

export const OrderCommentParamsSchema = z.object({
  id: z.uuid(),
});

export const MarkCommentsAsViewedSchema = z.object({
  // Optional: nếu bỏ trống thì đánh dấu tất cả comment của order là đã đọc
  commentId: z.uuid().optional(),
});

export type CreateOrderCommentDto = z.infer<typeof CreateOrderCommentSchema>;
export type UpdateOrderCommentDto = z.infer<typeof UpdateOrderCommentSchema>;
export type OrderCommentQueryDto = z.infer<typeof OrderCommentQuerySchema>;
export type OrderCommentParamsDto = z.infer<typeof OrderCommentParamsSchema>;
export type MarkCommentsAsViewedDto = z.infer<typeof MarkCommentsAsViewedSchema>;
