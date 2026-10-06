import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const auditLogsBodySchema = RetailBodySchema;
export const auditLogsQuerySchema = RetailQuerySchema;
export const auditLogsIdParamsSchema = z.object({ id: z.uuid() });
