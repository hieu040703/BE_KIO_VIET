import { injectable } from "inversify";
import { RetailStockCounts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { STOCKCOUNTS_RESOURCE } from "./stockCounts.types";

@injectable()
export class RetailStockCountsRepository extends BaseRepository<RetailStockCounts> {
  protected entityClass = RetailStockCounts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[STOCKCOUNTS_RESOURCE];
  }
}
