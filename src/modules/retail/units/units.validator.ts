import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const unitsBodySchema = RetailBodySchema;
export const unitsQuerySchema = RetailQuerySchema;
export const unitsIdParamsSchema = z.object({ id: z.uuid() });
