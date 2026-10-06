import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const stockCountItemsBodySchema = RetailBodySchema;
export const stockCountItemsQuerySchema = RetailQuerySchema;
export const stockCountItemsIdParamsSchema = z.object({ id: z.uuid() });
