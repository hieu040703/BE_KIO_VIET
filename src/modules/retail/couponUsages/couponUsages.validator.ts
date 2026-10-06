import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const couponUsagesBodySchema = RetailBodySchema;
export const couponUsagesQuerySchema = RetailQuerySchema;
export const couponUsagesIdParamsSchema = z.object({ id: z.uuid() });
