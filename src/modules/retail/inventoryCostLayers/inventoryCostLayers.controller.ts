import { injectable, inject } from "inversify";
import { RetailInventoryCostLayersService } from "./inventoryCostLayers.service";
import { RETAIL_INVENTORY_COST_LAYERS_TYPES } from "./inventoryCostLayers.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailInventoryCostLayersController extends BaseController<RetailInventoryCostLayersService> {
  constructor(@inject(RETAIL_INVENTORY_COST_LAYERS_TYPES.Service) protected service: RetailInventoryCostLayersService) {
    super(service);
  }
}
