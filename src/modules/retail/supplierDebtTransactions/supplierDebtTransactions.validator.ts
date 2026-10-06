import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const supplierDebtTransactionsBodySchema = RetailBodySchema;
export const supplierDebtTransactionsQuerySchema = RetailQuerySchema;
export const supplierDebtTransactionsIdParamsSchema = z.object({ id: z.uuid() });
