import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const customerTagsBodySchema = RetailBodySchema;
export const customerTagsQuerySchema = RetailQuerySchema;
export const customerTagsIdParamsSchema = z.object({ id: z.uuid() });
