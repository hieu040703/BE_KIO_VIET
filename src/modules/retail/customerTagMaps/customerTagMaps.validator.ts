import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const customerTagMapsBodySchema = RetailBodySchema;
export const customerTagMapsQuerySchema = RetailQuerySchema;
export const customerTagMapsIdParamsSchema = z.object({ id: z.uuid() });
