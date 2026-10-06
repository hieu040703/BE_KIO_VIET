import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const shipmentItemsBodySchema = RetailBodySchema;
export const shipmentItemsQuerySchema = RetailQuerySchema;
export const shipmentItemsIdParamsSchema = z.object({ id: z.uuid() });
