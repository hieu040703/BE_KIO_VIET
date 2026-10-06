import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const customerDebtTransactionsBodySchema = RetailBodySchema;
export const customerDebtTransactionsQuerySchema = RetailQuerySchema;
export const customerDebtTransactionsIdParamsSchema = z.object({ id: z.uuid() });
