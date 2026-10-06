import { ZaloTemplate } from "@/database/models/ZaloTemplate";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { injectable } from "inversify";
import { FindOptionsSelect } from "typeorm";
import { ZaloTemplateRelations, ZaloTemplateSelectFull } from "./zaloTemplate.select";

@injectable()
export class ZaloTemplateRepository extends BaseRepository<ZaloTemplate> {
  protected entityClass = ZaloTemplate;
  protected selectedFields = ZaloTemplateSelectFull;
  protected relations = ZaloTemplateRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<ZaloTemplate> | undefined): void {
    this.selectedFields = selectedFields || ZaloTemplateSelectFull;
    this.relations = ZaloTemplateRelations;
  }
}
