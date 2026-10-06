import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const promotionRulesBodySchema = RetailBodySchema;
export const promotionRulesQuerySchema = RetailQuerySchema;
export const promotionRulesIdParamsSchema = z.object({ id: z.uuid() });
