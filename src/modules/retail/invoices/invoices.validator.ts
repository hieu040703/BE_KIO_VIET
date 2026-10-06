import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const invoicesBodySchema = RetailBodySchema;
export const invoicesQuerySchema = RetailQuerySchema;
export const invoicesIdParamsSchema = z.object({ id: z.uuid() });
