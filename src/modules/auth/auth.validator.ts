import { z } from "zod";

export const AuthLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantId: z.uuid().optional(),
});

export type AuthLoginDto = z.infer<typeof AuthLoginSchema>;
