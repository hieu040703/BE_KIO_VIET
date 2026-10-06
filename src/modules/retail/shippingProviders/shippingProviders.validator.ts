import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const shippingProvidersBodySchema = RetailBodySchema;
export const shippingProvidersQuerySchema = RetailQuerySchema;
export const shippingProvidersIdParamsSchema = z.object({ id: z.uuid() });
