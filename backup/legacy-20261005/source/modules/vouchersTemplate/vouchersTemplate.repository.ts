import { VouchersTemplate } from "@/database/models/VouchersTemplate";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { injectable } from "inversify";
import { FindOptionsSelect } from "typeorm";
import { VouchersTemplateRelations, VouchersTemplateSelectFull } from "./vouchersTemplate.select";

@injectable()
export class VouchersTemplateRepository extends BaseRepository<VouchersTemplate> {
  protected entityClass = VouchersTemplate;
  protected selectedFields = VouchersTemplateSelectFull;
  protected relations = VouchersTemplateRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<VouchersTemplate>): void {
    this.selectedFields = selectedFields || VouchersTemplateSelectFull;
    this.relations = VouchersTemplateRelations;
  }
}
