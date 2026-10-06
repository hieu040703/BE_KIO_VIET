import { z } from "zod";
import { AddressSchema } from "../common/common.validator";
import { AdsEnum, GenderType } from "@/shared/constants/constance";
import { BaseSchema } from "@/shared/base/BaseSchema";

export const CreateCustomerSchema = z.object({
  code: z.string().optional(),
  name: z.string(),
  phone: z.string(),
  zaloName: z.string().nullish(),
  customName: z.string().nullish(),
  source: z.enum(AdsEnum).nullish(),
  address: AddressSchema.optional(),
  email: z.string().nullish(),
  dob: z.coerce.date().nullish(),
  gender: z.nativeEnum(GenderType).nullish(),
  taxCode: z.string().nullish(),
  businessCode: z.string().nullish(),
  openingDebt: z.number().default(0).optional(),
  referralCode: z.string().nullish(),
  referralStaff: z.uuid().nullish(),
  note: z.string().nullish(),
});

export const UpdateCustomerSchema = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  zaloName: z.string().nullish(),
  customName: z.string().nullish(),
  source: z.enum(AdsEnum).nullish(),
  address: AddressSchema.optional(),
  email: z.string().nullish(),
  dob: z.coerce.date().nullish(),
  gender: z.nativeEnum(GenderType).nullish(),
  taxCode: z.string().nullish(),
  businessCode: z.string().nullish(),
  openingDebt: z.number().default(0).optional(),
  referralCode: z.string().nullish(),
  referralStaff: z.uuid().nullish(),
  note: z.string().nullish(),
});

export const CustomerQuerySchema = BaseSchema.extend({
  source: z.enum(AdsEnum).optional(),
  // FE gửi `sortType` (theo convention ApiRequestQuery), BE BaseRepository dùng `sortOrder`.
  sortType: z.enum(["ASC", "DESC"]).optional(),
});

export const CustomerParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>;
export type CustomerQueryDto = z.infer<typeof CustomerQuerySchema>;
export type CustomerParamsDto = z.infer<typeof CustomerParamsSchema>;

export const ClientQuerySchema = BaseSchema.extend({});
export type ClientQueryDto = z.infer<typeof ClientQuerySchema>;

export const UpdateClientCustomerProfileSchema = z.object({
  customName: z.string().nullish(),
  address: AddressSchema.optional(),
  email: z.string().nullish(),
  dob: z.coerce.date().nullish(),
  businessCode: z.string().nullish(),
  gender: z.nativeEnum(GenderType).nullish(),
});

export type UpdateClientCustomerProfileDto = z.infer<typeof UpdateClientCustomerProfileSchema>;
