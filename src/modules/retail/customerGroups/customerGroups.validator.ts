import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const customerGroupsBodySchema = RetailBodySchema;
export const customerGroupsQuerySchema = RetailQuerySchema;
export const customerGroupsIdParamsSchema = z.object({ id: z.uuid() });
