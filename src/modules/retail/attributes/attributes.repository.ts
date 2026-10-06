import { injectable } from "inversify";
import { RetailAttributes } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ATTRIBUTES_RESOURCE } from "./attributes.types";

@injectable()
export class RetailAttributesRepository extends BaseRepository<RetailAttributes> {
  protected entityClass = RetailAttributes;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ATTRIBUTES_RESOURCE];
  }
}
