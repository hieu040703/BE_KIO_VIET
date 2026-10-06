import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const stockCountsBodySchema = RetailBodySchema;
export const stockCountsQuerySchema = RetailQuerySchema;
export const stockCountsIdParamsSchema = z.object({ id: z.uuid() });
