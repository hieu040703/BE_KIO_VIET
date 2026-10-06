import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const customerNotesBodySchema = RetailBodySchema;
export const customerNotesQuerySchema = RetailQuerySchema;
export const customerNotesIdParamsSchema = z.object({ id: z.uuid() });
