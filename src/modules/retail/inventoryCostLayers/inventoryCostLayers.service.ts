import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailInventoryCostLayers } from "@/database/models/retail/RetailGenericEntities";
import { RetailInventoryCostLayersRepository } from "./inventoryCostLayers.repository";
import { RETAIL_INVENTORY_COST_LAYERS_TYPES } from "./inventoryCostLayers.types";

@injectable()
export class RetailInventoryCostLayersService extends BaseService<RetailInventoryCostLayers> {
  constructor(@inject(RETAIL_INVENTORY_COST_LAYERS_TYPES.Repository) repository: RetailInventoryCostLayersRepository) {
    super(repository);
  }
}
