import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const stockAdjustmentsBodySchema = RetailBodySchema;
export const stockAdjustmentsQuerySchema = RetailQuerySchema;
export const stockAdjustmentsIdParamsSchema = z.object({ id: z.uuid() });
