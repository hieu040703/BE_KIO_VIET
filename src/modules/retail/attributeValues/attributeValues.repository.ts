import { injectable } from "inversify";
import { RetailAttributeValues } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ATTRIBUTEVALUES_RESOURCE } from "./attributeValues.types";

@injectable()
export class RetailAttributeValuesRepository extends BaseRepository<RetailAttributeValues> {
  protected entityClass = RetailAttributeValues;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ATTRIBUTEVALUES_RESOURCE];
  }
}
