import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const rolePermissionsBodySchema = RetailBodySchema;
export const rolePermissionsQuerySchema = RetailQuerySchema;
export const rolePermissionsIdParamsSchema = z.object({ id: z.uuid() });
