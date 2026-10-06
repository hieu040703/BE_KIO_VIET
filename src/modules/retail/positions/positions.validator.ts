import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const positionsBodySchema = RetailBodySchema;
export const positionsQuerySchema = RetailQuerySchema;
export const positionsIdParamsSchema = z.object({ id: z.uuid() });
