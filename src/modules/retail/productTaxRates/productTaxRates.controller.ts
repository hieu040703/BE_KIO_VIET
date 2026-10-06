import { injectable, inject } from "inversify";
import { RetailProductTaxRatesService } from "./productTaxRates.service";
import { RETAIL_PRODUCT_TAX_RATES_TYPES } from "./productTaxRates.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailProductTaxRatesController extends BaseController<RetailProductTaxRatesService> {
  constructor(@inject(RETAIL_PRODUCT_TAX_RATES_TYPES.Service) protected service: RetailProductTaxRatesService) {
    super(service);
  }
}
