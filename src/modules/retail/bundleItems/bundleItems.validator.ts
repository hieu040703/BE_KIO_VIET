import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const bundleItemsBodySchema = RetailBodySchema;
export const bundleItemsQuerySchema = RetailQuerySchema;
export const bundleItemsIdParamsSchema = z.object({ id: z.uuid() });
