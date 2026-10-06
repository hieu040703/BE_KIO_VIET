import { z } from "zod";
import { RetailBodySchema, RetailQuerySchema } from "../retail.validator";

export const attendanceDevicesBodySchema = RetailBodySchema;
export const attendanceDevicesQuerySchema = RetailQuerySchema;
export const attendanceDevicesIdParamsSchema = z.object({ id: z.uuid() });
