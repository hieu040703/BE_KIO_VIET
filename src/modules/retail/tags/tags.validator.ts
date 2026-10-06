import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const tagsBodySchema = RetailBodySchema;
export const tagsQuerySchema = RetailQuerySchema;
export const tagsIdParamsSchema = z.object({ id: z.uuid() });
