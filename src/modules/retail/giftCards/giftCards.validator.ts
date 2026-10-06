import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const giftCardsBodySchema = RetailBodySchema;
export const giftCardsQuerySchema = RetailQuerySchema;
export const giftCardsIdParamsSchema = z.object({ id: z.uuid() });
