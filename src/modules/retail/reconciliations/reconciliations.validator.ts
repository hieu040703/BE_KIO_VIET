import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const reconciliationsBodySchema = RetailBodySchema;
export const reconciliationsQuerySchema = RetailQuerySchema;
export const reconciliationsIdParamsSchema = z.object({ id: z.uuid() });
