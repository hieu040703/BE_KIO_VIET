import { injectable, inject } from "inversify";
import { RetailProductUnitsService } from "./productUnits.service";
import { RETAIL_PRODUCT_UNITS_TYPES } from "./productUnits.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailProductUnitsController extends BaseController<RetailProductUnitsService> {
  constructor(@inject(RETAIL_PRODUCT_UNITS_TYPES.Service) protected service: RetailProductUnitsService) {
    super(service);
  }
}
