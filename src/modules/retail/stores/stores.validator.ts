import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const storesBodySchema = RetailBodySchema;
export const storesQuerySchema = RetailQuerySchema;
export const storesIdParamsSchema = z.object({ id: z.uuid() });
