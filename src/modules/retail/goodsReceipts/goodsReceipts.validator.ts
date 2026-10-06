import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const goodsReceiptsBodySchema = RetailBodySchema;
export const goodsReceiptsQuerySchema = RetailQuerySchema;
export const goodsReceiptsIdParamsSchema = z.object({ id: z.uuid() });
