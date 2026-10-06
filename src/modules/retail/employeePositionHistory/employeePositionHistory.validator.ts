import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const employeePositionHistoryBodySchema = RetailBodySchema;
export const employeePositionHistoryQuerySchema = RetailQuerySchema;
export const employeePositionHistoryIdParamsSchema = z.object({ id: z.uuid() });
