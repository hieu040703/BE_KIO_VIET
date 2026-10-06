import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const reconciliationItemsBodySchema = RetailBodySchema;
export const reconciliationItemsQuerySchema = RetailQuerySchema;
export const reconciliationItemsIdParamsSchema = z.object({ id: z.uuid() });
