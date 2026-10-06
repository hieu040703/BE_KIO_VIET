import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const giftCardTransactionsBodySchema = RetailBodySchema;
export const giftCardTransactionsQuerySchema = RetailQuerySchema;
export const giftCardTransactionsIdParamsSchema = z.object({ id: z.uuid() });
