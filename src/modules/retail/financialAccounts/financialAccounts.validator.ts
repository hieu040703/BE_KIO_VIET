import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const financialAccountsBodySchema = RetailBodySchema;
export const financialAccountsQuerySchema = RetailQuerySchema;
export const financialAccountsIdParamsSchema = z.object({ id: z.uuid() });
