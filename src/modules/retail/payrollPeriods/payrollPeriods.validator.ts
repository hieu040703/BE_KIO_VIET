import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const payrollPeriodsBodySchema = RetailBodySchema;
export const payrollPeriodsQuerySchema = RetailQuerySchema;
export const payrollPeriodsIdParamsSchema = z.object({ id: z.uuid() });
