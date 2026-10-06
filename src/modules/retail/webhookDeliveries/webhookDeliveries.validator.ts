import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const webhookDeliveriesBodySchema = RetailBodySchema;
export const webhookDeliveriesQuerySchema = RetailQuerySchema;
export const webhookDeliveriesIdParamsSchema = z.object({ id: z.uuid() });
