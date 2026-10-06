import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { AttributeRepository } from "./attribute.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { ATTRIBUTE_TYPES } from "./attribute.types";
import { COMMON_TYPES } from "../common/common.types";
import { Attribute } from "@/database/models/Attribute";
import { AttributeRelations, AttributeSelectFull } from "./attribute.select";
import { IEntityManager } from "@/shared/types/interfaces";
import { Request } from "express";
import { CreateAttributeDto } from "./attribute.validator";
import { AttributeTypeEnum } from "@/shared/constants/constance";

@injectable()
export class AttributeService extends BaseService<Attribute> {
  protected relations = AttributeRelations;
  protected selectedFields = AttributeSelectFull;
  constructor(
    @inject(ATTRIBUTE_TYPES.AttributeRepository) private attributeRepository: AttributeRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(attributeRepository);
  }

  async validateBeforeCreate(data: CreateAttributeDto, req?: Request, manager?: IEntityManager): Promise<void> {
    const exists = await this.attributeRepository.checkExistsByNameAndType(data.name, data.type, manager);
    if (exists) {
      return;
    }
  }

  async checkExistNameAndType(name: string, type: AttributeTypeEnum, manager?: IEntityManager): Promise<boolean> {
    return this.attributeRepository.checkExistsByNameAndType(name, type, manager);
  }
}
