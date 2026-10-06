import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailProductTaxRatesController } from "./productTaxRates.controller";
import { RetailProductTaxRatesRepository } from "./productTaxRates.repository";
import { RetailProductTaxRatesRouter } from "./productTaxRates.route";
import { RetailProductTaxRatesService } from "./productTaxRates.service";
import { RETAIL_PRODUCT_TAX_RATES_TYPES } from "./productTaxRates.types";

export const productTaxRatesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailProductTaxRatesRepository>(RETAIL_PRODUCT_TAX_RATES_TYPES.Repository).to(RetailProductTaxRatesRepository);
  options.bind<RetailProductTaxRatesService>(RETAIL_PRODUCT_TAX_RATES_TYPES.Service).to(RetailProductTaxRatesService);
  options.bind<RetailProductTaxRatesController>(RETAIL_PRODUCT_TAX_RATES_TYPES.Controller).to(RetailProductTaxRatesController);
  options.bind<RetailProductTaxRatesRouter>(RETAIL_PRODUCT_TAX_RATES_TYPES.Router).to(RetailProductTaxRatesRouter);
});
