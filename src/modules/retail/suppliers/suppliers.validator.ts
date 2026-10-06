import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const suppliersBodySchema = RetailBodySchema;
export const suppliersQuerySchema = RetailQuerySchema;
export const suppliersIdParamsSchema = z.object({ id: z.uuid() });
