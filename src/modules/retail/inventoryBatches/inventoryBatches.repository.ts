import { injectable } from "inversify";
import { RetailInventoryBatches } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { INVENTORYBATCHES_RESOURCE } from "./inventoryBatches.types";

@injectable()
export class RetailInventoryBatchesRepository extends BaseRepository<RetailInventoryBatches> {
  protected entityClass = RetailInventoryBatches;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[INVENTORYBATCHES_RESOURCE];
  }
}
