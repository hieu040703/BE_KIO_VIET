import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const cartItemsBodySchema = RetailBodySchema;
export const cartItemsQuerySchema = RetailQuerySchema;
export const cartItemsIdParamsSchema = z.object({ id: z.uuid() });
