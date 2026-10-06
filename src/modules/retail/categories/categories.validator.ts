import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const categoriesBodySchema = RetailBodySchema;
export const categoriesQuerySchema = RetailQuerySchema;
export const categoriesIdParamsSchema = z.object({ id: z.uuid() });
