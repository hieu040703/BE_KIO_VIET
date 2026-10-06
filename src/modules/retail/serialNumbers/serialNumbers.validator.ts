import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const serialNumbersBodySchema = RetailBodySchema;
export const serialNumbersQuerySchema = RetailQuerySchema;
export const serialNumbersIdParamsSchema = z.object({ id: z.uuid() });
