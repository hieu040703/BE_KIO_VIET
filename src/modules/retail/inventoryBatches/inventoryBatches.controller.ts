import { injectable, inject } from "inversify";
import { RetailInventoryBatchesService } from "./inventoryBatches.service";
import { RETAIL_INVENTORY_BATCHES_TYPES } from "./inventoryBatches.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailInventoryBatchesController extends BaseController<RetailInventoryBatchesService> {
  constructor(@inject(RETAIL_INVENTORY_BATCHES_TYPES.Service) protected service: RetailInventoryBatchesService) {
    super(service);
  }
}
