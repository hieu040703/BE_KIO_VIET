import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const exchangesBodySchema = RetailBodySchema;
export const exchangesQuerySchema = RetailQuerySchema;
export const exchangesIdParamsSchema = z.object({ id: z.uuid() });
