import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const customerActivitiesBodySchema = RetailBodySchema;
export const customerActivitiesQuerySchema = RetailQuerySchema;
export const customerActivitiesIdParamsSchema = z.object({ id: z.uuid() });
