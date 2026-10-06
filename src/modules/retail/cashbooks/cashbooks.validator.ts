import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const cashbooksBodySchema = RetailBodySchema;
export const cashbooksQuerySchema = RetailQuerySchema;
export const cashbooksIdParamsSchema = z.object({ id: z.uuid() });
