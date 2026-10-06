import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const cashMovementsBodySchema = RetailBodySchema;
export const cashMovementsQuerySchema = RetailQuerySchema;
export const cashMovementsIdParamsSchema = z.object({ id: z.uuid() });
