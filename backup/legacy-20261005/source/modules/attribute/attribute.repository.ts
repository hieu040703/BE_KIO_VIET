import { BaseRepository } from "@/shared/base/BaseRepository";
import { Attribute } from "@/database/models/Attribute";
import { EntityManager, FindOptionsSelect } from "typeorm";
import { AttributeSelectFull, AttributeRelations } from "./attribute.select";
import { AttributeTypeEnum } from "@/shared/constants/constance";

export class AttributeRepository extends BaseRepository<Attribute> {
  protected entityClass = Attribute;
  protected selectedFields = AttributeSelectFull;
  protected relations = AttributeRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<Attribute> | undefined): void {
    this.selectedFields = selectedFields || AttributeSelectFull;
    this.relations = AttributeRelations;
  }

  async checkExistsByNameAndType(name: string, type: AttributeTypeEnum, manager?: EntityManager): Promise<boolean> {
    const count = await this.count({ name, type }, manager);
    console.log(name, type);
    console.log("count", count);
    return count > 0;
  }

  async checkAndAddNew(
    attributeName: string,
    attributeType: AttributeTypeEnum,
    manager?: EntityManager,
  ): Promise<void> {
    const existingAttribute = await this.findOne({ name: attributeName, type: attributeType }, manager);
    if (!existingAttribute) {
      await this.create({ name: attributeName, type: attributeType });
    }
  }
}
