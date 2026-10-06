import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const orderItemsBodySchema = RetailBodySchema;
export const orderItemsQuerySchema = RetailQuerySchema;
export const orderItemsIdParamsSchema = z.object({ id: z.uuid() });
