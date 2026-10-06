import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailInventoryBatches } from "@/database/models/retail/RetailGenericEntities";
import { RetailInventoryBatchesRepository } from "./inventoryBatches.repository";
import { RETAIL_INVENTORY_BATCHES_TYPES } from "./inventoryBatches.types";

@injectable()
export class RetailInventoryBatchesService extends BaseService<RetailInventoryBatches> {
  constructor(@inject(RETAIL_INVENTORY_BATCHES_TYPES.Repository) repository: RetailInventoryBatchesRepository) {
    super(repository);
  }
}
