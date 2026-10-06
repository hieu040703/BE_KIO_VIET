import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const variantAttributeValuesBodySchema = RetailBodySchema;
export const variantAttributeValuesQuerySchema = RetailQuerySchema;
export const variantAttributeValuesIdParamsSchema = z.object({ id: z.uuid() });
