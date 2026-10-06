import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const warehousesBodySchema = RetailBodySchema;
export const warehousesQuerySchema = RetailQuerySchema;
export const warehousesIdParamsSchema = z.object({ id: z.uuid() });
