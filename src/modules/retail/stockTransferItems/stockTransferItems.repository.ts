import { injectable } from "inversify";
import { RetailStockTransferItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { STOCKTRANSFERITEMS_RESOURCE } from "./stockTransferItems.types";

@injectable()
export class RetailStockTransferItemsRepository extends BaseRepository<RetailStockTransferItems> {
  protected entityClass = RetailStockTransferItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[STOCKTRANSFERITEMS_RESOURCE];
  }
}
