import { z } from "zod";

export const CreateTokenSchema = z.object({
  userId: z.number({ message: "userId.required" }),
  refreshToken: z.string({ message: "refreshToken.required" }).optional(),
  firebaseToken: z.string({ message: "firebaseToken.required" }).optional(),
  expiresAt: z.date({ message: "expiresAt.required" }).optional(),
});

export const UpdateTokenSchema = z.object({
  userId: z.number({ message: "userId.invalid" }).optional(),
  refreshToken: z.string({ message: "refreshToken.invalid" }).optional(),
  firebaseToken: z.string({ message: "firebaseToken.invalid" }).optional(),
  expiresAt: z.date({ message: "expiresAt.invalid" }).optional(),
});

export const TokenQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .optional(),
  size: z
    .string()
    .transform((val) => parseInt(val) || 10)
    .optional(),
  keyword: z.string().optional(),
});

export const TokenParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateTokenDto = z.infer<typeof CreateTokenSchema>;
export type UpdateTokenDto = z.infer<typeof UpdateTokenSchema>;
export type TokenQueryDto = z.infer<typeof TokenQuerySchema>;
export type TokenParamsDto = z.infer<typeof TokenParamsSchema>;
