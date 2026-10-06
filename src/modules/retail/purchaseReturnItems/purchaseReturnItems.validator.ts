import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const purchaseReturnItemsBodySchema = RetailBodySchema;
export const purchaseReturnItemsQuerySchema = RetailQuerySchema;
export const purchaseReturnItemsIdParamsSchema = z.object({ id: z.uuid() });
