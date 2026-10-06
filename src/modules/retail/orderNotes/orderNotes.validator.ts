import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const orderNotesBodySchema = RetailBodySchema;
export const orderNotesQuerySchema = RetailQuerySchema;
export const orderNotesIdParamsSchema = z.object({ id: z.uuid() });
