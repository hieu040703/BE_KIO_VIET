import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const stockReservationsBodySchema = RetailBodySchema;
export const stockReservationsQuerySchema = RetailQuerySchema;
export const stockReservationsIdParamsSchema = z.object({ id: z.uuid() });
