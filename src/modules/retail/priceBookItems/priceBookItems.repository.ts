import { injectable } from "inversify";
import { RetailPriceBookItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PRICEBOOKITEMS_RESOURCE } from "./priceBookItems.types";

@injectable()
export class RetailPriceBookItemsRepository extends BaseRepository<RetailPriceBookItems> {
  protected entityClass = RetailPriceBookItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PRICEBOOKITEMS_RESOURCE];
  }
}
