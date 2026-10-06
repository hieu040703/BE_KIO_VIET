import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const employeeSalaryComponentsBodySchema = RetailBodySchema;
export const employeeSalaryComponentsQuerySchema = RetailQuerySchema;
export const employeeSalaryComponentsIdParamsSchema = z.object({ id: z.uuid() });
