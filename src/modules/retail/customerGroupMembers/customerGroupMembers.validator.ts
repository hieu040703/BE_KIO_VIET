import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const customerGroupMembersBodySchema = RetailBodySchema;
export const customerGroupMembersQuerySchema = RetailQuerySchema;
export const customerGroupMembersIdParamsSchema = z.object({ id: z.uuid() });
