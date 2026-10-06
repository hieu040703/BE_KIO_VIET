import { injectable } from "inversify";
import { RetailCustomerTags } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CUSTOMERTAGS_RESOURCE } from "./customerTags.types";

@injectable()
export class RetailCustomerTagsRepository extends BaseRepository<RetailCustomerTags> {
  protected entityClass = RetailCustomerTags;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CUSTOMERTAGS_RESOURCE];
  }
}
