import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const branchesBodySchema = RetailBodySchema;
export const branchesQuerySchema = RetailQuerySchema;
export const branchesIdParamsSchema = z.object({ id: z.uuid() });
