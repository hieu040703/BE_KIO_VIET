import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const paymentAllocationsBodySchema = RetailBodySchema;
export const paymentAllocationsQuerySchema = RetailQuerySchema;
export const paymentAllocationsIdParamsSchema = z.object({ id: z.uuid() });
