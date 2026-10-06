import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const tenantSettingsBodySchema = RetailBodySchema;
export const tenantSettingsQuerySchema = RetailQuerySchema;
export const tenantSettingsIdParamsSchema = z.object({ id: z.uuid() });
