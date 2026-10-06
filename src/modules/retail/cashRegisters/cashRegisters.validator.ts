import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const cashRegistersBodySchema = RetailBodySchema;
export const cashRegistersQuerySchema = RetailQuerySchema;
export const cashRegistersIdParamsSchema = z.object({ id: z.uuid() });
