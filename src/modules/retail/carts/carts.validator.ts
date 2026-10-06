import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const cartsBodySchema = RetailBodySchema;
export const cartsQuerySchema = RetailQuerySchema;
export const cartsIdParamsSchema = z.object({ id: z.uuid() });
