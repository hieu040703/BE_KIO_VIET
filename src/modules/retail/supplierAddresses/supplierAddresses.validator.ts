import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const supplierAddressesBodySchema = RetailBodySchema;
export const supplierAddressesQuerySchema = RetailQuerySchema;
export const supplierAddressesIdParamsSchema = z.object({ id: z.uuid() });
