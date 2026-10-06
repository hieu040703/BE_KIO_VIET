import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const overtimeRequestsBodySchema = RetailBodySchema;
export const overtimeRequestsQuerySchema = RetailQuerySchema;
export const overtimeRequestsIdParamsSchema = z.object({ id: z.uuid() });
