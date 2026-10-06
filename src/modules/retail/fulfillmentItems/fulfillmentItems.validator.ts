import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const fulfillmentItemsBodySchema = RetailBodySchema;
export const fulfillmentItemsQuerySchema = RetailQuerySchema;
export const fulfillmentItemsIdParamsSchema = z.object({ id: z.uuid() });
