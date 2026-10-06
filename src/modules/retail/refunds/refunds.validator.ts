import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const refundsBodySchema = RetailBodySchema;
export const refundsQuerySchema = RetailQuerySchema;
export const refundsIdParamsSchema = z.object({ id: z.uuid() });
