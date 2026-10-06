import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const stockAdjustmentItemsBodySchema = RetailBodySchema;
export const stockAdjustmentItemsQuerySchema = RetailQuerySchema;
export const stockAdjustmentItemsIdParamsSchema = z.object({ id: z.uuid() });
