import { z } from "zod";
import { AddressSchema } from "../common/common.validator";
import { SettingSchema } from "../common/common.validator";
import { AuthSessionTypeEnum } from "@/shared/constants/constance";

export const RegisterSchema = z.object({
  email: z.email().optional(),
  phone: z.string(),
  password: z.string().min(6),
  name: z.string().min(3).nullish(),
  verifyKey: z.string().optional(),
  verifyCode: z.string().optional(),
});

export const RegisterPhoneSchema = z.object({
  phone: z.string(),
  password: z.string().min(6),
  name: z.string().min(3).nullish(),
  email: z.email().optional(),
  taxCode: z.string().optional(),
  businessCode: z.string().optional(),
  referralCode: z.string().optional(),
});

export type RegisterPhoneDto = z.infer<typeof RegisterPhoneSchema>;

export const LoginSchema = z.object({
  email: z.string().min(1, "email.required").optional(),
  username: z.string().min(1, "username.required").optional(),
  password: z.string().min(6),
  token: z.string({ message: "token.required" }).optional(),
  clientType: z.enum([AuthSessionTypeEnum.WEB, AuthSessionTypeEnum.MOBILE]).optional(),
});

export const LogoutSchema = z.object({
  firebaseToken: z.string().optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const VerifyPhoneSchema = z.object({
  phone: z.string().min(1, "phone.required"),
  isForgotPassword: z.boolean().optional().default(false),
});

export const VerifyEmailSchema = z.object({
  email: z.string().email("Invalid email format"),
  isForgotPassword: z.boolean().optional().default(false),
});

export const ForgetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  verifyKey: z.string({ message: "verifyKey.required" }),
  verifyCode: z.string({ message: "verifyCode.required" }),
  newPassword: z.string().min(6, "New password is required"),
});

export const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, "Old password is required"),
    newPassword: z.string().min(6, "New password is required"),
    confirmNewPassword: z.string().min(6, "Confirm new password is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirm new password must match",
  });

export const UpdateInformationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatar: z.string().optional(),
  address: z
    .object({
      country: z.string().nullish(),
      state: z.string(),
      ward: z.string(),
      detail: z.string().nullish(),
      zip: z.string().nullish(),
      longitude: z.number().nullish(),
      latitude: z.number().nullish(),
    })
    .optional(),
  privacySettings: z
    .object({
      showEmail: z.boolean().optional(),
      showPhone: z.boolean().optional(),
      showAddress: z.boolean().optional(),
    })
    .optional(),
});

export const UpdateEmployeeInformationSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  phone: z.string().nullish(),
  address: AddressSchema.optional(),
  email: z.string().nullish(),
  company: z.string().nullish(),
  avatar: z.string().nullish(),
});

export const UpdateSettingsSchema = SettingSchema;

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type LogoutDto = z.infer<typeof LogoutSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
export type VerifyPhoneDto = z.infer<typeof VerifyPhoneSchema>;
export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>;
export type ForgetPasswordDto = z.infer<typeof ForgetPasswordSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type UpdateInformationDto = z.infer<typeof UpdateInformationSchema>;
export type UpdateEmployeeInformationDto = z.infer<typeof UpdateEmployeeInformationSchema>;
export type UpdateSettingsDto = z.infer<typeof UpdateSettingsSchema>;
