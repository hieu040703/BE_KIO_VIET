import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const brandsBodySchema = RetailBodySchema;
export const brandsQuerySchema = RetailQuerySchema;
export const brandsIdParamsSchema = z.object({ id: z.uuid() });
