import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const productsBodySchema = RetailBodySchema;
export const productsQuerySchema = RetailQuerySchema;
export const productsIdParamsSchema = z.object({ id: z.uuid() });
