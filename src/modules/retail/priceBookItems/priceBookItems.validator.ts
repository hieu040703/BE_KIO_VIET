import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const priceBookItemsBodySchema = RetailBodySchema;
export const priceBookItemsQuerySchema = RetailQuerySchema;
export const priceBookItemsIdParamsSchema = z.object({ id: z.uuid() });
