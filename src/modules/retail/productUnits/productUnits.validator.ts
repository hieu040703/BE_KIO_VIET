import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const productUnitsBodySchema = RetailBodySchema;
export const productUnitsQuerySchema = RetailQuerySchema;
export const productUnitsIdParamsSchema = z.object({ id: z.uuid() });
