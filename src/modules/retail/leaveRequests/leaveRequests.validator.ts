import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const leaveRequestsBodySchema = RetailBodySchema;
export const leaveRequestsQuerySchema = RetailQuerySchema;
export const leaveRequestsIdParamsSchema = z.object({ id: z.uuid() });
