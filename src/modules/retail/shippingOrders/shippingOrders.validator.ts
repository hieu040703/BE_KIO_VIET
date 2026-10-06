import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const shippingOrdersBodySchema = RetailBodySchema;
export const shippingOrdersQuerySchema = RetailQuerySchema;
export const shippingOrdersIdParamsSchema = z.object({ id: z.uuid() });
