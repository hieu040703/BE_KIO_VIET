import { AppSetting } from "@/database/models/AppSetting";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const AppSettingSelectBasic: FindOptionsSelect<AppSetting> = {
  id: true,
  order: true,
  customer: true,
  employee: true,
  voucher: true,
  notification: true,
  note: true,
  createdAt: true,
  updatedAt: true,
};

export const AppSettingSelectFull: FindOptionsSelect<AppSetting> = {
  ...AppSettingSelectBasic,
};

export const AppSettingRelations: FindOptionsRelations<AppSetting> = {};
