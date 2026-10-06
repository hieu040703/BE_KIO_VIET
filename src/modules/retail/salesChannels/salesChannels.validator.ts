import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const salesChannelsBodySchema = RetailBodySchema;
export const salesChannelsQuerySchema = RetailQuerySchema;
export const salesChannelsIdParamsSchema = z.object({ id: z.uuid() });
