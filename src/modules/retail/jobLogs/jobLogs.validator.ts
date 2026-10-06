import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const jobLogsBodySchema = RetailBodySchema;
export const jobLogsQuerySchema = RetailQuerySchema;
export const jobLogsIdParamsSchema = z.object({ id: z.uuid() });
