import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const accountTransactionsBodySchema = RetailBodySchema;
export const accountTransactionsQuerySchema = RetailQuerySchema;
export const accountTransactionsIdParamsSchema = z.object({ id: z.uuid() });
