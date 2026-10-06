import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const inventoryBatchesBodySchema = RetailBodySchema;
export const inventoryBatchesQuerySchema = RetailQuerySchema;
export const inventoryBatchesIdParamsSchema = z.object({ id: z.uuid() });
