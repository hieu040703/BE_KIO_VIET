import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const departmentsBodySchema = RetailBodySchema;
export const departmentsQuerySchema = RetailQuerySchema;
export const departmentsIdParamsSchema = z.object({ id: z.uuid() });
