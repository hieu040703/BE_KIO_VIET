import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const jobsBodySchema = RetailBodySchema;
export const jobsQuerySchema = RetailQuerySchema;
export const jobsIdParamsSchema = z.object({ id: z.uuid() });
