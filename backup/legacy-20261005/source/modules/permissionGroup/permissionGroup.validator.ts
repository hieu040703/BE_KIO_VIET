import { BaseSchema } from "@/shared/base/BaseSchema";
import { z } from "zod";

export const CreatePermissionGroupSchema = z.object({
  name: z.string({ message: "name.required" }),
  permissions: z.record(z.string(), z.array(z.string())).optional(),
});

export const UpdatePermissionGroupSchema = z.object({
  name: z.string({ message: "name.invalid" }).optional(),
  permissions: z.record(z.string(), z.array(z.string())).optional(),
});

export const PermissionGroupQuerySchema = BaseSchema.extend({});

export const PermissionGroupParamsSchema = z.object({
  id: z.uuid(),
});

export type CreatePermissionGroupDto = z.infer<typeof CreatePermissionGroupSchema>;
export type UpdatePermissionGroupDto = z.infer<typeof UpdatePermissionGroupSchema>;
export type PermissionGroupQueryDto = z.infer<typeof PermissionGroupQuerySchema>;
export type PermissionGroupParamsDto = z.infer<typeof PermissionGroupParamsSchema>;
