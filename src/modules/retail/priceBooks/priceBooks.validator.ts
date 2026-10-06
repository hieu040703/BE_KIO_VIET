import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const priceBooksBodySchema = RetailBodySchema;
export const priceBooksQuerySchema = RetailQuerySchema;
export const priceBooksIdParamsSchema = z.object({ id: z.uuid() });
