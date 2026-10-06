import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const employeeBranchAssignmentsBodySchema = RetailBodySchema;
export const employeeBranchAssignmentsQuerySchema = RetailQuerySchema;
export const employeeBranchAssignmentsIdParamsSchema = z.object({ id: z.uuid() });
