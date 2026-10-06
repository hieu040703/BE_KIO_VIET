import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const filesBodySchema = RetailBodySchema;
export const filesQuerySchema = RetailQuerySchema;
export const filesIdParamsSchema = z.object({ id: z.uuid() });
