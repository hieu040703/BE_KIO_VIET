import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const attributeValuesBodySchema = RetailBodySchema;
export const attributeValuesQuerySchema = RetailQuerySchema;
export const attributeValuesIdParamsSchema = z.object({ id: z.uuid() });
