import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
export const CreateSupportRoomSchema = z.object({
  name: z.string(),
  customerId: z.string().uuid(),
});
export const UpdateSupportRoomSchema = z.object({
  name: z.string().optional(),
});

export const SupportRoomQuerySchema = BaseSchema.extend({});

export const SupportRoomParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateSupportRoomDto = z.infer<typeof CreateSupportRoomSchema>;
export type UpdateSupportRoomDto = z.infer<typeof UpdateSupportRoomSchema>;
export type SupportRoomQueryDto = z.infer<typeof SupportRoomQuerySchema>;
export type SupportRoomParamsDto = z.infer<typeof SupportRoomParamsSchema>;
