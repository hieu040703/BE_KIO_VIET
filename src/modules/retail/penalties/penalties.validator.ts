import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const penaltiesBodySchema = RetailBodySchema;
export const penaltiesQuerySchema = RetailQuerySchema;
export const penaltiesIdParamsSchema = z.object({ id: z.uuid() });
