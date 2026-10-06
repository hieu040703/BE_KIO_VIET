import { injectable, inject } from "inversify";
import { RetailWarehousesService } from "./warehouses.service";
import { RETAIL_WAREHOUSES_TYPES } from "./warehouses.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailWarehousesController extends BaseController<RetailWarehousesService> {
  constructor(@inject(RETAIL_WAREHOUSES_TYPES.Service) protected service: RetailWarehousesService) {
    super(service);
  }
}
