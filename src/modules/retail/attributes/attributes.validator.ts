import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const attributesBodySchema = RetailBodySchema;
export const attributesQuerySchema = RetailQuerySchema;
export const attributesIdParamsSchema = z.object({ id: z.uuid() });
