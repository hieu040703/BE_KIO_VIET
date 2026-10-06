import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const expensesBodySchema = RetailBodySchema;
export const expensesQuerySchema = RetailQuerySchema;
export const expensesIdParamsSchema = z.object({ id: z.uuid() });
