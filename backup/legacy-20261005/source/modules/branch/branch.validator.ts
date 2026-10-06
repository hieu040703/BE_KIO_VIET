import { z } from "zod";
import { AddressSchema } from "../common/common.validator";
import { BaseSchema } from "@/shared/base/BaseSchema";

export const CreateBranchSchema = z.object({
  name: z.string(),
  code: z.string().nullish(),
  address: AddressSchema.optional(),
  employeeId: z.uuid().nullish(),
  hotline: z.string().max(20).nullish(),
  isInternal: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  note: z.string().nullish(),
});

export const UpdateBranchSchema = z.object({
  name: z.string().optional(),
  code: z.string().nullish(),
  address: AddressSchema.optional(),
  employeeId: z.uuid().nullish(),
  hotline: z.string().max(20).nullish(),
  isInternal: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  note: z.string().nullish(),
});

export const BranchQuerySchema = BaseSchema.extend({
  sortBy: z.string().default("code").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("ASC").optional(),
});
export const BranchParamsSchema = z.object({
  id: z.uuid(),
});
export type CreateBranchDto = z.infer<typeof CreateBranchSchema>;
export type UpdateBranchDto = z.infer<typeof UpdateBranchSchema>;
export type BranchQueryDto = z.infer<typeof BranchQuerySchema>;
export type BranchParamsDto = z.infer<typeof BranchParamsSchema>;
