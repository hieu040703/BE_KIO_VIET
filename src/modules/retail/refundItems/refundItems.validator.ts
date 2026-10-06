import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const refundItemsBodySchema = RetailBodySchema;
export const refundItemsQuerySchema = RetailQuerySchema;
export const refundItemsIdParamsSchema = z.object({ id: z.uuid() });
