import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const paymentTransactionsBodySchema = RetailBodySchema;
export const paymentTransactionsQuerySchema = RetailQuerySchema;
export const paymentTransactionsIdParamsSchema = z.object({ id: z.uuid() });
