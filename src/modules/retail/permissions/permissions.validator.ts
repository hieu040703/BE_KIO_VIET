import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const permissionsBodySchema = RetailBodySchema;
export const permissionsQuerySchema = RetailQuerySchema;
export const permissionsIdParamsSchema = z.object({ id: z.uuid() });
