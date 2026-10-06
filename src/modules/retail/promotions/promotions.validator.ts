import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const promotionsBodySchema = RetailBodySchema;
export const promotionsQuerySchema = RetailQuerySchema;
export const promotionsIdParamsSchema = z.object({ id: z.uuid() });
