import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const employeeContractsBodySchema = RetailBodySchema;
export const employeeContractsQuerySchema = RetailQuerySchema;
export const employeeContractsIdParamsSchema = z.object({ id: z.uuid() });
