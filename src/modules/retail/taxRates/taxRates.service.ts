import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailTaxRates } from "@/database/models/retail/RetailGenericEntities";
import { RetailTaxRatesRepository } from "./taxRates.repository";
import { RETAIL_TAX_RATES_TYPES } from "./taxRates.types";

@injectable()
export class RetailTaxRatesService extends BaseService<RetailTaxRates> {
  constructor(@inject(RETAIL_TAX_RATES_TYPES.Repository) repository: RetailTaxRatesRepository) {
    super(repository);
  }
}
