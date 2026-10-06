import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const workShiftsBodySchema = RetailBodySchema;
export const workShiftsQuerySchema = RetailQuerySchema;
export const workShiftsIdParamsSchema = z.object({ id: z.uuid() });
