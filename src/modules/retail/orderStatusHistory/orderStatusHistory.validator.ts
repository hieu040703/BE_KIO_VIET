import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const orderStatusHistoryBodySchema = RetailBodySchema;
export const orderStatusHistoryQuerySchema = RetailQuerySchema;
export const orderStatusHistoryIdParamsSchema = z.object({ id: z.uuid() });
