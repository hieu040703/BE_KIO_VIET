import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const purchaseReturnsBodySchema = RetailBodySchema;
export const purchaseReturnsQuerySchema = RetailQuerySchema;
export const purchaseReturnsIdParamsSchema = z.object({ id: z.uuid() });
