import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const fulfillmentsBodySchema = RetailBodySchema;
export const fulfillmentsQuerySchema = RetailQuerySchema;
export const fulfillmentsIdParamsSchema = z.object({ id: z.uuid() });
