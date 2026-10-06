import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const customerContactsBodySchema = RetailBodySchema;
export const customerContactsQuerySchema = RetailQuerySchema;
export const customerContactsIdParamsSchema = z.object({ id: z.uuid() });
