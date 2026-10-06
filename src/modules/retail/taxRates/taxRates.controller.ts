import { injectable, inject } from "inversify";
import { RetailTaxRatesService } from "./taxRates.service";
import { RETAIL_TAX_RATES_TYPES } from "./taxRates.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailTaxRatesController extends BaseController<RetailTaxRatesService> {
  constructor(@inject(RETAIL_TAX_RATES_TYPES.Service) protected service: RetailTaxRatesService) {
    super(service);
  }
}
