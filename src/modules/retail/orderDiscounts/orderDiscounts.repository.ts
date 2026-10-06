import { injectable } from "inversify";
import { RetailOrderDiscounts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ORDERDISCOUNTS_RESOURCE } from "./orderDiscounts.types";

@injectable()
export class RetailOrderDiscountsRepository extends BaseRepository<RetailOrderDiscounts> {
  protected entityClass = RetailOrderDiscounts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ORDERDISCOUNTS_RESOURCE];
  }
}
