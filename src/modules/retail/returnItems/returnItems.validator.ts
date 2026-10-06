import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const returnItemsBodySchema = RetailBodySchema;
export const returnItemsQuerySchema = RetailQuerySchema;
export const returnItemsIdParamsSchema = z.object({ id: z.uuid() });
