import { injectable } from "inversify";
import { RetailVariantAttributeValues } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { VARIANTATTRIBUTEVALUES_RESOURCE } from "./variantAttributeValues.types";

@injectable()
export class RetailVariantAttributeValuesRepository extends BaseRepository<RetailVariantAttributeValues> {
  protected entityClass = RetailVariantAttributeValues;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[VARIANTATTRIBUTEVALUES_RESOURCE];
  }
}
