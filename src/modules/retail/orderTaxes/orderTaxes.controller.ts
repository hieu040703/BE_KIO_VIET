import { injectable, inject } from "inversify";
import { RetailOrderTaxesService } from "./orderTaxes.service";
import { RETAIL_ORDER_TAXES_TYPES } from "./orderTaxes.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailOrderTaxesController extends BaseController<RetailOrderTaxesService> {
  constructor(@inject(RETAIL_ORDER_TAXES_TYPES.Service) protected service: RetailOrderTaxesService) {
    super(service);
  }
}
