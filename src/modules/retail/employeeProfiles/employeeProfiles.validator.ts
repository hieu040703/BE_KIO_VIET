import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const employeeProfilesBodySchema = RetailBodySchema;
export const employeeProfilesQuerySchema = RetailQuerySchema;
export const employeeProfilesIdParamsSchema = z.object({ id: z.uuid() });
