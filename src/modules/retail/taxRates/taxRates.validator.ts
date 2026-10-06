import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const taxRatesBodySchema = RetailBodySchema;
export const taxRatesQuerySchema = RetailQuerySchema;
export const taxRatesIdParamsSchema = z.object({ id: z.uuid() });
