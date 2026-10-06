import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const payrollItemsBodySchema = RetailBodySchema;
export const payrollItemsQuerySchema = RetailQuerySchema;
export const payrollItemsIdParamsSchema = z.object({ id: z.uuid() });
