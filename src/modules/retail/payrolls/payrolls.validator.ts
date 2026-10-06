import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const payrollsBodySchema = RetailBodySchema;
export const payrollsQuerySchema = RetailQuerySchema;
export const payrollsIdParamsSchema = z.object({ id: z.uuid() });
