import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const notificationRecipientsBodySchema = RetailBodySchema;
export const notificationRecipientsQuerySchema = RetailQuerySchema;
export const notificationRecipientsIdParamsSchema = z.object({ id: z.uuid() });
