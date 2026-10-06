import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const promotionActionsBodySchema = RetailBodySchema;
export const promotionActionsQuerySchema = RetailQuerySchema;
export const promotionActionsIdParamsSchema = z.object({ id: z.uuid() });
