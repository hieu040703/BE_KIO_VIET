import { injectable } from "inversify";
import { RetailStockAdjustmentItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { STOCKADJUSTMENTITEMS_RESOURCE } from "./stockAdjustmentItems.types";

@injectable()
export class RetailStockAdjustmentItemsRepository extends BaseRepository<RetailStockAdjustmentItems> {
  protected entityClass = RetailStockAdjustmentItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[STOCKADJUSTMENTITEMS_RESOURCE];
  }
}
