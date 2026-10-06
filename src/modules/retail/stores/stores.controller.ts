import { injectable, inject } from "inversify";
import { RetailStoresService } from "./stores.service";
import { RETAIL_STORES_TYPES } from "./stores.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailStoresController extends BaseController<RetailStoresService> {
  constructor(@inject(RETAIL_STORES_TYPES.Service) protected service: RetailStoresService) {
    super(service);
  }
}
