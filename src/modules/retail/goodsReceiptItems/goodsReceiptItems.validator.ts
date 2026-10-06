import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const goodsReceiptItemsBodySchema = RetailBodySchema;
export const goodsReceiptItemsQuerySchema = RetailQuerySchema;
export const goodsReceiptItemsIdParamsSchema = z.object({ id: z.uuid() });
