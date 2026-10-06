import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const userSessionsBodySchema = RetailBodySchema;
export const userSessionsQuerySchema = RetailQuerySchema;
export const userSessionsIdParamsSchema = z.object({ id: z.uuid() });
