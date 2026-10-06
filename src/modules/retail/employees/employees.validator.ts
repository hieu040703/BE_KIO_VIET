import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const employeesBodySchema = RetailBodySchema;
export const employeesQuerySchema = RetailQuerySchema;
export const employeesIdParamsSchema = z.object({ id: z.uuid() });
