import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const kpiDefinitionsBodySchema = RetailBodySchema;
export const kpiDefinitionsQuerySchema = RetailQuerySchema;
export const kpiDefinitionsIdParamsSchema = z.object({ id: z.uuid() });
