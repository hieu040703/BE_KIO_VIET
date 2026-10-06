import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
import { RewardPointTypeEnum } from "@/shared/constants/constance";

export const CreateRewardPointSchema = z.object({
  customerId: z.string(),
  orderId: z.string().nullable().optional(),
  points: z.number(),
  type: z.enum(RewardPointTypeEnum),
  note: z.string().nullish(),
});

export const UpdateRewardPointSchema = z.object({
  customerId: z.string().optional(),
  orderId: z.string().nullable().optional(),
  points: z.number().optional(),
  type: z.enum(RewardPointTypeEnum).optional(),
  note: z.string().nullish(),
});

export const RewardPointQuerySchema = BaseSchema.extend({});

export const RewardPointParamsSchema = z.object({
  id: z.uuid(),
});

export const ConvertMoneyToPointSchema = z.object({
  amount: z.number().nonnegative(),
});

export type CreateRewardPointDto = z.infer<typeof CreateRewardPointSchema>;
export type UpdateRewardPointDto = z.infer<typeof UpdateRewardPointSchema>;
export type RewardPointQueryDto = z.infer<typeof RewardPointQuerySchema>;
export type RewardPointParamsDto = z.infer<typeof RewardPointParamsSchema>;
export type ConvertMoneyToPointDto = z.infer<typeof ConvertMoneyToPointSchema>;
