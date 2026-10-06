import { z } from "zod";
import { AddressSchema } from "../common/common.validator";
import { EmployeeStatusType, PositionDefaultEnum } from "@/shared/constants/constance";
import { BaseSchema } from "@/shared/base/BaseSchema";

export const CreateEmployeeSchema = z.object({
  branchId: z.uuid(),
  code: z.string().max(20).optional(),
  name: z.string().max(255),
  dob: z.coerce.date().nullish(),
  gender: z.string().max(20).nullish(),
  email: z.string().max(255).nullish(),
  phone: z.coerce.string().max(50).nullish(),
  zaloName: z.string().nullish(),
  address: AddressSchema.optional(),
  managerId: z.uuid().nullish(),
  recruiterId: z.uuid().nullish(),
  identityNumber: z.coerce.string().nullish(),
  status: z.enum(EmployeeStatusType).optional(),
  isOfficial: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  position: z.enum(PositionDefaultEnum).nullish(),
  expertise: z.array(z.string()).optional(),
  department: z.string().max(100).nullish(),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  note: z.string().nullish(),
  tempId: z.string().nullish(),
});

export const UpdateEmployeeSchema = z.object({
  branchId: z.uuid().nullish(),
  code: z.string().max(20).optional(),
  name: z.string().max(255).optional(),
  dob: z.coerce.date().nullish(),
  gender: z.string().max(20).nullish(),
  email: z.string().nullish(),
  phone: z.coerce.string().nullish(),
  zaloName: z.string().nullish(),
  address: AddressSchema.optional(),
  managerId: z.uuid().nullish(),
  recruiterId: z.uuid().nullish(),
  identityNumber: z.coerce.string().nullish(),
  status: z.enum(EmployeeStatusType).optional(),
  isOfficial: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  position: z.enum(PositionDefaultEnum).nullish(),
  expertise: z.array(z.string()).optional(),
  department: z.string().max(100).nullish(),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  note: z.string().nullish(),
  tempId: z.string().nullish(),
});

export const EmployeeQuerySchema = BaseSchema.extend({
  branchIds: z.array(z.uuid()).optional(),
  status: z.enum(EmployeeStatusType).optional(),
  isWorking: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  /**
   * Lọc chỉ lấy nhân viên đang là quản lý chi nhánh (tồn tại Branch.employeeId = employee.id, chưa soft-delete).
   * Coerce từ string "true"/"false" hoặc boolean để tương thích query string.
   */
  isManager: z.union([z.boolean(), z.string().transform((val) => val === "true")]).optional(),
  /**
   * Loại trừ nhân viên đang là quản lý chi nhánh (tồn tại Branch.employeeId = employee.id, chưa soft-delete).
   * Coerce từ string "true"/"false" hoặc boolean để tương thích query string.
   */
  excludeManager: z.union([z.boolean(), z.string().transform((val) => val === "true")]).optional(),
  managerIds: z.array(z.uuid()).optional(),
  recruiterIds: z.array(z.uuid()).optional(),
  position: z.enum(PositionDefaultEnum).optional(),
  statuses: z.array(z.enum(EmployeeStatusType)).optional(),
});

export const EmployeeParamsSchema = z.object({
  id: z.uuid(),
});

export const UserIdParamsSchema = z.object({
  userId: z.uuid(),
});

export type CreateEmployeeDto = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof UpdateEmployeeSchema>;
export type EmployeeQueryDto = z.infer<typeof EmployeeQuerySchema>;
export type EmployeeParamsDto = z.infer<typeof EmployeeParamsSchema>;
export type UserIdParamsDto = z.infer<typeof UserIdParamsSchema>;
