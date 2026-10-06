import { VouchersTemplate } from "@/database/models/VouchersTemplate";
import { BaseService } from "@/shared/base/BaseService";
import { VouchersTemplateStatusEnum } from "@/shared/constants/constance";
import { IFindOptions, IEntityManager } from "@/shared/types/interfaces";
import { Request } from "express";
import { inject, injectable } from "inversify";
import { VouchersTemplateRelations, VouchersTemplateSelectFull } from "./vouchersTemplate.select";
import { VOUCHERS_TEMPLATE_TYPES } from "./vouchersTemplate.types";
import { VouchersTemplateRepository } from "./vouchersTemplate.repository";

@injectable()
export class ClientVouchersTemplateService extends BaseService<VouchersTemplate> {
  protected relations = VouchersTemplateRelations;
  protected selectedFields = VouchersTemplateSelectFull;
  protected selectedFieldsForList = VouchersTemplateSelectFull;

  constructor(
    @inject(VOUCHERS_TEMPLATE_TYPES.VouchersTemplateRepository)
    private vouchersTemplateRepository: VouchersTemplateRepository,
  ) {
    super(vouchersTemplateRepository);
  }

  async validateBeforeQuery(options: IFindOptions<VouchersTemplate>, _req?: Request, _manager?: IEntityManager) {
    options.status = VouchersTemplateStatusEnum.ACTIVE;
  }
}
