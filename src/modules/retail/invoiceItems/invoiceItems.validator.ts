import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const invoiceItemsBodySchema = RetailBodySchema;
export const invoiceItemsQuerySchema = RetailQuerySchema;
export const invoiceItemsIdParamsSchema = z.object({ id: z.uuid() });
