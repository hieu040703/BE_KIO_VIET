import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const stockTransfersBodySchema = RetailBodySchema;
export const stockTransfersQuerySchema = RetailQuerySchema;
export const stockTransfersIdParamsSchema = z.object({ id: z.uuid() });
