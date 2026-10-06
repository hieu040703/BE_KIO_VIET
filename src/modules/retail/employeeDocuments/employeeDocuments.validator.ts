import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const employeeDocumentsBodySchema = RetailBodySchema;
export const employeeDocumentsQuerySchema = RetailQuerySchema;
export const employeeDocumentsIdParamsSchema = z.object({ id: z.uuid() });
