import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const cashSessionsBodySchema = RetailBodySchema;
export const cashSessionsQuerySchema = RetailQuerySchema;
export const cashSessionsIdParamsSchema = z.object({ id: z.uuid() });
