import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
      export const CreateServiceOrderRatingSchema = z.object({  orderId: z.string(),
  employeeId: z.string(),
  rating: z.number(),
  review: z.string().nullable().optional() , note: z.string().nullish() });
      export const UpdateServiceOrderRatingSchema = z.object({   orderId: z.string().optional(),
  employeeId: z.string().optional(),
  rating: z.number().optional(),
  review: z.string().nullable().optional(), note: z.string().nullish() });

      export const ServiceOrderRatingQuerySchema = BaseSchema.extend({});

      export const ServiceOrderRatingParamsSchema = z.object({
        id: z.uuid(),
      });
      export type CreateServiceOrderRatingDto = z.infer<typeof CreateServiceOrderRatingSchema>;
      export type UpdateServiceOrderRatingDto = z.infer<typeof UpdateServiceOrderRatingSchema>;
      export type ServiceOrderRatingQueryDto = z.infer<typeof ServiceOrderRatingQuerySchema>;
      export type ServiceOrderRatingParamsDto = z.infer<typeof ServiceOrderRatingParamsSchema>;