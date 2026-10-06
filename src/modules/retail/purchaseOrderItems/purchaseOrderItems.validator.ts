import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const purchaseOrderItemsBodySchema = RetailBodySchema;
export const purchaseOrderItemsQuerySchema = RetailQuerySchema;
export const purchaseOrderItemsIdParamsSchema = z.object({ id: z.uuid() });
