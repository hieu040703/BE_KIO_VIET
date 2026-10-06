import { injectable, inject } from "inversify";
import { RetailInventoriesService } from "./inventories.service";
import { RETAIL_INVENTORIES_TYPES } from "./inventories.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailInventoriesController extends BaseController<RetailInventoriesService> {
  constructor(@inject(RETAIL_INVENTORIES_TYPES.Service) protected service: RetailInventoriesService) {
    super(service);
  }
}
