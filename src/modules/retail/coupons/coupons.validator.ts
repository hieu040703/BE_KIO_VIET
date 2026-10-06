import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const couponsBodySchema = RetailBodySchema;
export const couponsQuerySchema = RetailQuerySchema;
export const couponsIdParamsSchema = z.object({ id: z.uuid() });
