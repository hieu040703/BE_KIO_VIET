import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailTaxRatesController } from "./taxRates.controller";
import { RetailTaxRatesRepository } from "./taxRates.repository";
import { RetailTaxRatesRouter } from "./taxRates.route";
import { RetailTaxRatesService } from "./taxRates.service";
import { RETAIL_TAX_RATES_TYPES } from "./taxRates.types";

export const taxRatesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailTaxRatesRepository>(RETAIL_TAX_RATES_TYPES.Repository).to(RetailTaxRatesRepository);
  options.bind<RetailTaxRatesService>(RETAIL_TAX_RATES_TYPES.Service).to(RetailTaxRatesService);
  options.bind<RetailTaxRatesController>(RETAIL_TAX_RATES_TYPES.Controller).to(RetailTaxRatesController);
  options.bind<RetailTaxRatesRouter>(RETAIL_TAX_RATES_TYPES.Router).to(RetailTaxRatesRouter);
});
