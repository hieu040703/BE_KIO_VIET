import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const customerDebtsBodySchema = RetailBodySchema;
export const customerDebtsQuerySchema = RetailQuerySchema;
export const customerDebtsIdParamsSchema = z.object({ id: z.uuid() });
