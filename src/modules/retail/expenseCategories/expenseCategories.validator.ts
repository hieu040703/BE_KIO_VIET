import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const expenseCategoriesBodySchema = RetailBodySchema;
export const expenseCategoriesQuerySchema = RetailQuerySchema;
export const expenseCategoriesIdParamsSchema = z.object({ id: z.uuid() });
