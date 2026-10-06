import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const inventoryCostLayersBodySchema = RetailBodySchema;
export const inventoryCostLayersQuerySchema = RetailQuerySchema;
export const inventoryCostLayersIdParamsSchema = z.object({ id: z.uuid() });
