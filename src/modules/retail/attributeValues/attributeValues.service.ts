import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailAttributeValues } from "@/database/models/retail/RetailGenericEntities";
import { RetailAttributeValuesRepository } from "./attributeValues.repository";
import { RETAIL_ATTRIBUTE_VALUES_TYPES } from "./attributeValues.types";

@injectable()
export class RetailAttributeValuesService extends BaseService<RetailAttributeValues> {
  constructor(@inject(RETAIL_ATTRIBUTE_VALUES_TYPES.Repository) repository: RetailAttributeValuesRepository) {
    super(repository);
  }
}
