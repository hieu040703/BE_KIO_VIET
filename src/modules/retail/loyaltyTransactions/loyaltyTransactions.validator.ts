import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const loyaltyTransactionsBodySchema = RetailBodySchema;
export const loyaltyTransactionsQuerySchema = RetailQuerySchema;
export const loyaltyTransactionsIdParamsSchema = z.object({ id: z.uuid() });
