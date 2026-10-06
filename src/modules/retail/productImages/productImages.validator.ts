import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const productImagesBodySchema = RetailBodySchema;
export const productImagesQuerySchema = RetailQuerySchema;
export const productImagesIdParamsSchema = z.object({ id: z.uuid() });
