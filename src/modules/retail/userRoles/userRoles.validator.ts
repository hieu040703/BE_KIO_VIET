import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const userRolesBodySchema = RetailBodySchema;
export const userRolesQuerySchema = RetailQuerySchema;
export const userRolesIdParamsSchema = z.object({ id: z.uuid() });
