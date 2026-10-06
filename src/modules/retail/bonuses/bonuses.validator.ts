import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const bonusesBodySchema = RetailBodySchema;
export const bonusesQuerySchema = RetailQuerySchema;
export const bonusesIdParamsSchema = z.object({ id: z.uuid() });
