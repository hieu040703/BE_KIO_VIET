import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const attendanceLogsBodySchema = RetailBodySchema;
export const attendanceLogsQuerySchema = RetailQuerySchema;
export const attendanceLogsIdParamsSchema = z.object({ id: z.uuid() });
