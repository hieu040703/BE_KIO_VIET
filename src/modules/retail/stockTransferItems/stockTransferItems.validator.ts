import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const stockTransferItemsBodySchema = RetailBodySchema;
export const stockTransferItemsQuerySchema = RetailQuerySchema;
export const stockTransferItemsIdParamsSchema = z.object({ id: z.uuid() });
