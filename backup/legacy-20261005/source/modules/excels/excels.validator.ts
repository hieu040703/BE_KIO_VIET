import dayjs from "dayjs";
import { z } from "zod";

export const ImportOrderExcelSchema = z.object({
  code: z.string(),
  shopName: z.string(),
  phone: z.string(),
  timeAt: z.string().transform((val) => dayjs(val, "DD-MM-YYYY HH:mm:ss").toDate()),
  cod: z.coerce.number().min(0),
  originalCod: z.coerce.number().min(0),
  weight: z.coerce.number().min(0),
  shippingFee: z.coerce.number().min(0),
  itemPrice: z.coerce.number().min(0),
  description: z.string().optional(),
  receiverName: z.string(),
  shippingPostOffice: z.string().optional(),
});

export const ExportEmployeeHrSchema = z.object({
  // Define the schema for exporting employee HR data if needed
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
});

export type ImportOrderExcelDto = z.infer<typeof ImportOrderExcelSchema>;
export type ExportEmployeeHrDto = z.infer<typeof ExportEmployeeHrSchema>;
