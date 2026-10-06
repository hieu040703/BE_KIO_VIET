import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const supplierContactsBodySchema = RetailBodySchema;
export const supplierContactsQuerySchema = RetailQuerySchema;
export const supplierContactsIdParamsSchema = z.object({ id: z.uuid() });
