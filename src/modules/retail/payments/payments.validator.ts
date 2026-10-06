import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const paymentsBodySchema = RetailBodySchema;
export const paymentsQuerySchema = RetailQuerySchema;
export const paymentsIdParamsSchema = z.object({ id: z.uuid() });
