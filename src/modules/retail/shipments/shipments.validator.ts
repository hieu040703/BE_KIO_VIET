import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const shipmentsBodySchema = RetailBodySchema;
export const shipmentsQuerySchema = RetailQuerySchema;
export const shipmentsIdParamsSchema = z.object({ id: z.uuid() });
