import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const apiKeysBodySchema = RetailBodySchema;
export const apiKeysQuerySchema = RetailQuerySchema;
export const apiKeysIdParamsSchema = z.object({ id: z.uuid() });
