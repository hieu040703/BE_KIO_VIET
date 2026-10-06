import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const notificationsBodySchema = RetailBodySchema;
export const notificationsQuerySchema = RetailQuerySchema;
export const notificationsIdParamsSchema = z.object({ id: z.uuid() });
