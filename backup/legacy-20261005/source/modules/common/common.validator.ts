import dayjs from "dayjs";
import { z } from "zod";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const AddressSchema = z.object({
  country: z.string().nullish(),
  state: z.string().optional(),
  ward: z.string().optional(),
  detail: z.string().nullish(),
  zip: z.string().nullish(),
  longitude: z.number().nullish(),
  latitude: z.number().nullish(),
});

export type IAddress = z.infer<typeof AddressSchema>;

export const SettingSchema = z.object({
  region: z
    .object({
      country: z.string().nullish(),
      language: z.string().nullish(),
      timezone: z.string().nullish(),
    })
    .optional(),
  dateFormat: z
    .object({
      date: z.string().nullish(),
      time: z.string().nullish(),
      displayTime: z.string().nullish(),
    })
    .optional(),
  numberFormat: z
    .object({
      decimal: z.string().nullish(),
      thousand: z.string().nullish(),
      fraction: z.string().nullish(),
    })
    .optional(),
  currencyFormat: z
    .object({
      symbol: z.string().nullish(),
      fraction: z.string().nullish(),
      position: z.enum(["before", "after"]).optional(),
    })
    .optional(),
});

export type ISetting = z.infer<typeof SettingSchema>;

export const BankAccountSchema = z.object({
  bankName: z.string(),
  accountNumber: z.string(),
  accountHolder: z.string(),
  branch: z.string().nullish(),
});

export type IBankAccount = z.infer<typeof BankAccountSchema>;

export const CitizenIdentificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  dob: z.date().nullish(),
  gender: z.string().nullish(),
  issuedDate: z.date().nullish(),
  expirationDate: z.date().nullish(),
  placeOfIssue: z.string().nullish(),
  issuedBy: z.string().nullish(),
  files: z.array(z.string()).optional().default([]),
});
export type ICitizenIdentification = z.infer<typeof CitizenIdentificationSchema>;

export const GetDashboardStatsSchema = z.object({
  startAt: z.coerce.date().optional().default(dayjs().tz("Asia/Ho_Chi_Minh").startOf("month").toDate()),
  endAt: z.coerce.date().optional().default(dayjs().tz("Asia/Ho_Chi_Minh").endOf("month").toDate()),
  branchId: z.uuid().optional(),
});
export type GetDashboardStatsDto = z.infer<typeof GetDashboardStatsSchema>;
