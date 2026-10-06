import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const stockLedgersBodySchema = RetailBodySchema;
export const stockLedgersQuerySchema = RetailQuerySchema;
export const stockLedgersIdParamsSchema = z.object({ id: z.uuid() });
