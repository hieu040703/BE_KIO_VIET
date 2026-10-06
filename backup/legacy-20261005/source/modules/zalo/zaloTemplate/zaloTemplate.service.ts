import { ZaloTemplate } from "@/database/models/ZaloTemplate";
import { BaseService } from "@/shared/base/BaseService";
import { injectable, inject } from "inversify";
import { ZaloTemplateRepository } from "./zaloTemplate.repository";
import { ZaloTemplateRelations, ZaloTemplateSelectFull } from "./zaloTemplate.select";
import { ZALO_TEMPLATE_TYPES } from "./zaloTemplate.types";

@injectable()
export class ZaloTemplateService extends BaseService<ZaloTemplate> {
  protected findOptions = {};
  protected relations = ZaloTemplateRelations;
  protected selectedFields = ZaloTemplateSelectFull;
  protected uniqueFields: (keyof ZaloTemplate)[] = ["type"];
  protected searchableFields: (keyof ZaloTemplate)[] & string[] = ["name", "templateId", "type"] as any;

  constructor(
    @inject(ZALO_TEMPLATE_TYPES.ZaloTemplateRepository)
    private zaloTemplateRepository: ZaloTemplateRepository,
  ) {
    super(zaloTemplateRepository);
    this.setOptions(this.findOptions, this.selectedFields, this.relations);
  }
}
