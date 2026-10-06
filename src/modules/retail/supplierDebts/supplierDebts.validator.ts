import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const supplierDebtsBodySchema = RetailBodySchema;
export const supplierDebtsQuerySchema = RetailQuerySchema;
export const supplierDebtsIdParamsSchema = z.object({ id: z.uuid() });
