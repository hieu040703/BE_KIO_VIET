import { injectable } from "inversify";
import { RetailExchangeItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EXCHANGEITEMS_RESOURCE } from "./exchangeItems.types";

@injectable()
export class RetailExchangeItemsRepository extends BaseRepository<RetailExchangeItems> {
  protected entityClass = RetailExchangeItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EXCHANGEITEMS_RESOURCE];
  }
}
