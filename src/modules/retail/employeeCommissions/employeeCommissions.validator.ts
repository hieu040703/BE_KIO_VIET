import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const employeeCommissionsBodySchema = RetailBodySchema;
export const employeeCommissionsQuerySchema = RetailQuerySchema;
export const employeeCommissionsIdParamsSchema = z.object({ id: z.uuid() });
