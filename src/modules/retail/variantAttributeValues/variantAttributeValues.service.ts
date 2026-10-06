import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailVariantAttributeValues } from "@/database/models/retail/RetailGenericEntities";
import { RetailVariantAttributeValuesRepository } from "./variantAttributeValues.repository";
import { RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES } from "./variantAttributeValues.types";

@injectable()
export class RetailVariantAttributeValuesService extends BaseService<RetailVariantAttributeValues> {
  constructor(@inject(RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES.Repository) repository: RetailVariantAttributeValuesRepository) {
    super(repository);
  }
}
