import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const loyaltyAccountsBodySchema = RetailBodySchema;
export const loyaltyAccountsQuerySchema = RetailQuerySchema;
export const loyaltyAccountsIdParamsSchema = z.object({ id: z.uuid() });
