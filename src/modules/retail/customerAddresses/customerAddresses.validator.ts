import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const customerAddressesBodySchema = RetailBodySchema;
export const customerAddressesQuerySchema = RetailQuerySchema;
export const customerAddressesIdParamsSchema = z.object({ id: z.uuid() });
