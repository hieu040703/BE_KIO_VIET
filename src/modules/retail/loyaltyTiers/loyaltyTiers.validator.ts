import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const loyaltyTiersBodySchema = RetailBodySchema;
export const loyaltyTiersQuerySchema = RetailQuerySchema;
export const loyaltyTiersIdParamsSchema = z.object({ id: z.uuid() });
