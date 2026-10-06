import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const customersBodySchema = RetailBodySchema;
export const customersQuerySchema = RetailQuerySchema;
export const customersIdParamsSchema = z.object({ id: z.uuid() });
