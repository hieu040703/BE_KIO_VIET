import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const productTaxRatesBodySchema = RetailBodySchema;
export const productTaxRatesQuerySchema = RetailQuerySchema;
export const productTaxRatesIdParamsSchema = z.object({ id: z.uuid() });
