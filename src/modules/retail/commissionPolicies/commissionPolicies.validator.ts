import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const commissionPoliciesBodySchema = RetailBodySchema;
export const commissionPoliciesQuerySchema = RetailQuerySchema;
export const commissionPoliciesIdParamsSchema = z.object({ id: z.uuid() });
