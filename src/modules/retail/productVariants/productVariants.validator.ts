import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const productVariantsBodySchema = RetailBodySchema;
export const productVariantsQuerySchema = RetailQuerySchema;
export const productVariantsIdParamsSchema = z.object({ id: z.uuid() });
