import { injectable } from "inversify";
import { RetailStockCountItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { STOCKCOUNTITEMS_RESOURCE } from "./stockCountItems.types";

@injectable()
export class RetailStockCountItemsRepository extends BaseRepository<RetailStockCountItems> {
  protected entityClass = RetailStockCountItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[STOCKCOUNTITEMS_RESOURCE];
  }
}
