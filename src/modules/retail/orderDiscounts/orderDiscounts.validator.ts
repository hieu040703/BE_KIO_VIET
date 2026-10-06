import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const orderDiscountsBodySchema = RetailBodySchema;
export const orderDiscountsQuerySchema = RetailQuerySchema;
export const orderDiscountsIdParamsSchema = z.object({ id: z.uuid() });
