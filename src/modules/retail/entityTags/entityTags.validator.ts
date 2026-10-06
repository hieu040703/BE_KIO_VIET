import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const entityTagsBodySchema = RetailBodySchema;
export const entityTagsQuerySchema = RetailQuerySchema;
export const entityTagsIdParamsSchema = z.object({ id: z.uuid() });
