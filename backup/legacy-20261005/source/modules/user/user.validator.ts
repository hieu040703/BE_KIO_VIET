import { UserRoleEnum } from "@/shared/constants/constance";
import { z } from "zod";
import { AddressSchema, SettingSchema } from "../common/common.validator";
import { BaseSchema } from "@/shared/base/BaseSchema";

export const CreateUserSchema = z.object({
  code: z.string().max(255).optional(),
  customerId: z.uuid().nullish(),
  employeeId: z.uuid().nullish(),
  username: z.string().max(255),
  password: z.string().max(255),
  role: z.enum(UserRoleEnum).optional(),
  email: z.string().max(255).optional(),
  name: z.string().max(255).optional(),
  phone: z.string().max(20).nullish(),
  avatar: z.string().max(255).nullish(),
  address: AddressSchema.optional(),
  isActive: z.boolean().optional(),
  setting: SettingSchema.optional(),
  permissionGroupId: z.uuid().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string({ message: "name.invalid" }).max(255).optional(),
  role: z.enum(UserRoleEnum, { message: "role.invalid" }).optional(),
  username: z.string({ message: "username.invalid" }).max(255).optional(),
  phone: z.string({ message: "phone.invalid" }).max(20).nullish(),
  avatar: z.string({ message: "avatar.invalid" }).max(255).nullish(),
  address: AddressSchema.optional(),
  isActive: z.boolean({ message: "isActive.invalid" }).optional(),
  email: z.string({ message: "email.invalid" }).max(255).nullish(),
  employeeId: z.uuid().optional(),
});

export const UpdateManagerSchema = z.object({
  employeeId: z.uuid().optional(),
  role: z.enum(UserRoleEnum).optional(),
  name: z.string().max(255).nullish(),
  username: z.string({ message: "username.invalid" }).max(255).optional(),
  phone: z.string().max(20).nullish(),
  email: z.string().max(255).nullish(),
  avatar: z.string().max(255).nullish(),
  permissionGroupId: z.uuid().optional(),
  address: AddressSchema.optional(),
});

export const UserQuerySchema = BaseSchema.extend({
  userType: z.enum(["system", "customer"]).optional(),
});

export const UserParamsSchema = z.object({
  id: z.uuid(),
});

export const UserActionSchema = z.object({
  action: z.enum(["activate", "deactivate"], {
    message: "action.invalid",
  }),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UpdateManagerDto = z.infer<typeof UpdateManagerSchema>;
export type UserQueryDto = z.infer<typeof UserQuerySchema>;
export type UserParamsDto = z.infer<typeof UserParamsSchema>;
export type UserActionDto = z.infer<typeof UserActionSchema>;
