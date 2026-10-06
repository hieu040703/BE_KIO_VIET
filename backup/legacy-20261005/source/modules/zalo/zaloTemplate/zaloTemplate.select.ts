import { ZaloTemplate } from "@/database/models/ZaloTemplate";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const ZaloTemplateSelectBasic: FindOptionsSelect<ZaloTemplate> = {
  id: true,
  name: true,
  type: true,
  templateId: true,
  note: true,
};

export const ZaloTemplateSelectFull: FindOptionsSelect<ZaloTemplate> = {
  ...ZaloTemplateSelectBasic,
};

export const ZaloTemplateRelations: FindOptionsRelations<ZaloTemplate> = {};
