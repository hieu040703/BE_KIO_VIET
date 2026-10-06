import { VouchersTemplate } from "@/database/models/VouchersTemplate";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const VouchersTemplateSelectBasic: FindOptionsSelect<VouchersTemplate> = {
  id: true,
  name: true,
  code: true,
  points: true,
  amount: true,
  status: true,
  note: true,
  createdAt: true,
  updatedAt: true,
};

export const VouchersTemplateSelectFull: FindOptionsSelect<VouchersTemplate> = {
  ...VouchersTemplateSelectBasic,
};

export const VouchersTemplateRelations: FindOptionsRelations<VouchersTemplate> = {};
