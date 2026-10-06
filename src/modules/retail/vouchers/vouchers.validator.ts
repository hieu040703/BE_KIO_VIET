import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const vouchersBodySchema = RetailBodySchema;
export const vouchersQuerySchema = RetailQuerySchema;
export const vouchersIdParamsSchema = z.object({ id: z.uuid() });
