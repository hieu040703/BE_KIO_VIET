import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const leaveBalancesBodySchema = RetailBodySchema;
export const leaveBalancesQuerySchema = RetailQuerySchema;
export const leaveBalancesIdParamsSchema = z.object({ id: z.uuid() });
