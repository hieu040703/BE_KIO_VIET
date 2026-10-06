import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const attendancesBodySchema = RetailBodySchema;
export const attendancesQuerySchema = RetailQuerySchema;
export const attendancesIdParamsSchema = z.object({ id: z.uuid() });
