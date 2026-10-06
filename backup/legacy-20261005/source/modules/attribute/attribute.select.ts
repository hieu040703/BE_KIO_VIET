import { Attribute } from "@/database/models/Attribute";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const AttributeSelectBasic: FindOptionsSelect<Attribute> = {
  id: true,
  name: true,
  code: true,
  type: true,
  value: true,
  isDefault: true,
};

export const AttributeSelectFull: FindOptionsSelect<Attribute> = {
  ...AttributeSelectBasic,
};

export const AttributeRelations: FindOptionsRelations<Attribute> = {};
