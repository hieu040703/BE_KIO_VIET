import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailOrderTaxesController } from "./orderTaxes.controller";
import { RetailOrderTaxesRepository } from "./orderTaxes.repository";
import { RetailOrderTaxesRouter } from "./orderTaxes.route";
import { RetailOrderTaxesService } from "./orderTaxes.service";
import { RETAIL_ORDER_TAXES_TYPES } from "./orderTaxes.types";

export const orderTaxesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailOrderTaxesRepository>(RETAIL_ORDER_TAXES_TYPES.Repository).to(RetailOrderTaxesRepository);
  options.bind<RetailOrderTaxesService>(RETAIL_ORDER_TAXES_TYPES.Service).to(RetailOrderTaxesService);
  options.bind<RetailOrderTaxesController>(RETAIL_ORDER_TAXES_TYPES.Controller).to(RetailOrderTaxesController);
  options.bind<RetailOrderTaxesRouter>(RETAIL_ORDER_TAXES_TYPES.Router).to(RetailOrderTaxesRouter);
});
