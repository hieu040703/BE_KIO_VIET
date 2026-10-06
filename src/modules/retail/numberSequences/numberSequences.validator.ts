import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const numberSequencesBodySchema = RetailBodySchema;
export const numberSequencesQuerySchema = RetailQuerySchema;
export const numberSequencesIdParamsSchema = z.object({ id: z.uuid() });
