import { injectable } from "inversify";
import { RetailStockAdjustments } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { STOCKADJUSTMENTS_RESOURCE } from "./stockAdjustments.types";

@injectable()
export class RetailStockAdjustmentsRepository extends BaseRepository<RetailStockAdjustments> {
  protected entityClass = RetailStockAdjustments;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[STOCKADJUSTMENTS_RESOURCE];
  }
}
