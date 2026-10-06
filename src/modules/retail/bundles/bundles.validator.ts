import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const bundlesBodySchema = RetailBodySchema;
export const bundlesQuerySchema = RetailQuerySchema;
export const bundlesIdParamsSchema = z.object({ id: z.uuid() });
