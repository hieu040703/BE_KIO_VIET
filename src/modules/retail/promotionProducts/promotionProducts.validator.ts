import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const promotionProductsBodySchema = RetailBodySchema;
export const promotionProductsQuerySchema = RetailQuerySchema;
export const promotionProductsIdParamsSchema = z.object({ id: z.uuid() });
