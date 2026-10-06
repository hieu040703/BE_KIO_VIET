import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const tenantsBodySchema = RetailBodySchema;
export const tenantsQuerySchema = RetailQuerySchema;
export const tenantsIdParamsSchema = z.object({ id: z.uuid() });
