import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailProductTaxRates } from "@/database/models/retail/RetailGenericEntities";
import { RetailProductTaxRatesRepository } from "./productTaxRates.repository";
import { RETAIL_PRODUCT_TAX_RATES_TYPES } from "./productTaxRates.types";

@injectable()
export class RetailProductTaxRatesService extends BaseService<RetailProductTaxRates> {
  constructor(@inject(RETAIL_PRODUCT_TAX_RATES_TYPES.Repository) repository: RetailProductTaxRatesRepository) {
    super(repository);
  }
}
