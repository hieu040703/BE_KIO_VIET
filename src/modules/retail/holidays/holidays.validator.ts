import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const holidaysBodySchema = RetailBodySchema;
export const holidaysQuerySchema = RetailQuerySchema;
export const holidaysIdParamsSchema = z.object({ id: z.uuid() });
