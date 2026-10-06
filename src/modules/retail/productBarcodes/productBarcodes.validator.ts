import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const productBarcodesBodySchema = RetailBodySchema;
export const productBarcodesQuerySchema = RetailQuerySchema;
export const productBarcodesIdParamsSchema = z.object({ id: z.uuid() });
