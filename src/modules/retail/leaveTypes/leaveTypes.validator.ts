import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const leaveTypesBodySchema = RetailBodySchema;
export const leaveTypesQuerySchema = RetailQuerySchema;
export const leaveTypesIdParamsSchema = z.object({ id: z.uuid() });
