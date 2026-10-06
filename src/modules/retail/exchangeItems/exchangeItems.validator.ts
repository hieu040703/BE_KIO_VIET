import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const exchangeItemsBodySchema = RetailBodySchema;
export const exchangeItemsQuerySchema = RetailQuerySchema;
export const exchangeItemsIdParamsSchema = z.object({ id: z.uuid() });
