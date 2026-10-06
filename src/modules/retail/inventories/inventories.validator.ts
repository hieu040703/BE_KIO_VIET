import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const inventoriesBodySchema = RetailBodySchema;
export const inventoriesQuerySchema = RetailQuerySchema;
export const inventoriesIdParamsSchema = z.object({ id: z.uuid() });
