import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const purchaseOrdersBodySchema = RetailBodySchema;
export const purchaseOrdersQuerySchema = RetailQuerySchema;
export const purchaseOrdersIdParamsSchema = z.object({ id: z.uuid() });
