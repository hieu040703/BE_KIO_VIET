import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const orderTaxesBodySchema = RetailBodySchema;
export const orderTaxesQuerySchema = RetailQuerySchema;
export const orderTaxesIdParamsSchema = z.object({ id: z.uuid() });
