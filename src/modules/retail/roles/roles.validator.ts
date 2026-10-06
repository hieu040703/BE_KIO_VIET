import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const rolesBodySchema = RetailBodySchema;
export const rolesQuerySchema = RetailQuerySchema;
export const rolesIdParamsSchema = z.object({ id: z.uuid() });
