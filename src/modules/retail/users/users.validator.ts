import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const usersBodySchema = RetailBodySchema;
export const usersQuerySchema = RetailQuerySchema;
export const usersIdParamsSchema = z.object({ id: z.uuid() });
