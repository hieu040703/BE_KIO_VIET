import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const systemSettingsBodySchema = RetailBodySchema;
export const systemSettingsQuerySchema = RetailQuerySchema;
export const systemSettingsIdParamsSchema = z.object({ id: z.uuid() });
