import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const ordersBodySchema = RetailBodySchema;
export const ordersQuerySchema = RetailQuerySchema;
export const ordersIdParamsSchema = z.object({ id: z.uuid() });
