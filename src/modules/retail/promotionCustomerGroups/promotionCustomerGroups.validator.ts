import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const promotionCustomerGroupsBodySchema = RetailBodySchema;
export const promotionCustomerGroupsQuerySchema = RetailQuerySchema;
export const promotionCustomerGroupsIdParamsSchema = z.object({ id: z.uuid() });
