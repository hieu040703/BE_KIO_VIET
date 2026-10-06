import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const voucherTransactionsBodySchema = RetailBodySchema;
export const voucherTransactionsQuerySchema = RetailQuerySchema;
export const voucherTransactionsIdParamsSchema = z.object({ id: z.uuid() });
