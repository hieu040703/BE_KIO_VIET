import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const returnsBodySchema = RetailBodySchema;
export const returnsQuerySchema = RetailQuerySchema;
export const returnsIdParamsSchema = z.object({ id: z.uuid() });
