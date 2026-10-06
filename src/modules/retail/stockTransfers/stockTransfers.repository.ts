import { injectable } from "inversify";
import { RetailStockTransfers } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { STOCKTRANSFERS_RESOURCE } from "./stockTransfers.types";

@injectable()
export class RetailStockTransfersRepository extends BaseRepository<RetailStockTransfers> {
  protected entityClass = RetailStockTransfers;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[STOCKTRANSFERS_RESOURCE];
  }
}
