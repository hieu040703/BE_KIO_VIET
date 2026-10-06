import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const paymentMethodsBodySchema = RetailBodySchema;
export const paymentMethodsQuerySchema = RetailQuerySchema;
export const paymentMethodsIdParamsSchema = z.object({ id: z.uuid() });
