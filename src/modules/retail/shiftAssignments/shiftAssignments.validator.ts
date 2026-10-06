import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const shiftAssignmentsBodySchema = RetailBodySchema;
export const shiftAssignmentsQuerySchema = RetailQuerySchema;
export const shiftAssignmentsIdParamsSchema = z.object({ id: z.uuid() });
