import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const receiptsBodySchema = RetailBodySchema;
export const receiptsQuerySchema = RetailQuerySchema;
export const receiptsIdParamsSchema = z.object({ id: z.uuid() });
