import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const employeeKpisBodySchema = RetailBodySchema;
export const employeeKpisQuerySchema = RetailQuerySchema;
export const employeeKpisIdParamsSchema = z.object({ id: z.uuid() });
