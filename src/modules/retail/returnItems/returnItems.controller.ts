import { injectable, inject } from "inversify";
import { RetailReturnItemsService } from "./returnItems.service";
import { RETAIL_RETURN_ITEMS_TYPES } from "./returnItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailReturnItemsController extends BaseController<RetailReturnItemsService> {
  constructor(@inject(RETAIL_RETURN_ITEMS_TYPES.Service) protected service: RetailReturnItemsService) {
    super(service);
  }
}
