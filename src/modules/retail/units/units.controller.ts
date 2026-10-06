import { injectable, inject } from "inversify";
import { RetailUnitsService } from "./units.service";
import { RETAIL_UNITS_TYPES } from "./units.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailUnitsController extends BaseController<RetailUnitsService> {
  constructor(@inject(RETAIL_UNITS_TYPES.Service) protected service: RetailUnitsService) {
    super(service);
  }
}
