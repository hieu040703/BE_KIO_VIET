import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const salaryComponentsBodySchema = RetailBodySchema;
export const salaryComponentsQuerySchema = RetailQuerySchema;
export const salaryComponentsIdParamsSchema = z.object({ id: z.uuid() });
