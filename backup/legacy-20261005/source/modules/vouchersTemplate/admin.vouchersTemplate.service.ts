import { VouchersTemplate } from "@/database/models/VouchersTemplate";
import { BaseService } from "@/shared/base/BaseService";
import { BadRequestError } from "@/shared/types/errors";
import { IEntityManager } from "@/shared/types/interfaces";
import { DeepPartial } from "typeorm";
import { inject, injectable } from "inversify";
import { Request } from "express";
import { VouchersTemplateRelations, VouchersTemplateSelectFull } from "./vouchersTemplate.select";
import { VOUCHERS_TEMPLATE_TYPES } from "./vouchersTemplate.types";
import { VouchersTemplateRepository } from "./vouchersTemplate.repository";

@injectable()
export class AdminVouchersTemplateService extends BaseService<VouchersTemplate> {
  protected relations = VouchersTemplateRelations;
  protected selectedFields = VouchersTemplateSelectFull;
  protected selectedFieldsForList = VouchersTemplateSelectFull;
  protected uniqueFields: (keyof VouchersTemplate)[] = ["code"];
  protected searchableFields = ["name", "code"] as (keyof VouchersTemplate)[] & string[];

  constructor(
    @inject(VOUCHERS_TEMPLATE_TYPES.VouchersTemplateRepository)
    private vouchersTemplateRepository: VouchersTemplateRepository,
  ) {
    super(vouchersTemplateRepository);
  }

  async validateBeforeCreate(data: DeepPartial<VouchersTemplate>, _req?: Request, manager?: IEntityManager) {
    await this.validateCode(data.code, undefined, manager);
  }

  async validateBeforeUpdate(id: string, data: Partial<VouchersTemplate>, _req?: Request, manager?: IEntityManager) {
    if (data.code) {
      await this.validateCode(data.code, id, manager);
    }
  }

  private async validateCode(code: string | undefined, id?: string, manager?: IEntityManager): Promise<void> {
    if (!code) return;
    const exists = id
      ? await this.vouchersTemplateRepository.fieldExistsExcludingId("code", code, id, manager)
      : await this.vouchersTemplateRepository.fieldExists("code", code, manager);
    if (exists) {
      throw new BadRequestError("Mã mẫu phiếu giảm giá đã tồn tại");
    }
  }
}
