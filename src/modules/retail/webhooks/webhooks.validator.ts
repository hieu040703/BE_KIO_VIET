import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const webhooksBodySchema = RetailBodySchema;
export const webhooksQuerySchema = RetailQuerySchema;
export const webhooksIdParamsSchema = z.object({ id: z.uuid() });
