import { Fund } from "@/database/models/Fund";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const FundSelectBasic: FindOptionsSelect<Fund> = {
  id: true,
  name: true,
  bankName: true,
  bin: true,
  accountNumber: true,
  accountHolder: true,
  branch: true,
  isDefault: true,
  note: true,
};

export const FundSelectFull: FindOptionsSelect<Fund> = {
  ...FundSelectBasic,
};

export const FundRelations: FindOptionsRelations<Fund> = {};
