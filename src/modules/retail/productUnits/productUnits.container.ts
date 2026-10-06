import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailProductUnitsController } from "./productUnits.controller";
import { RetailProductUnitsRepository } from "./productUnits.repository";
import { RetailProductUnitsRouter } from "./productUnits.route";
import { RetailProductUnitsService } from "./productUnits.service";
import { RETAIL_PRODUCT_UNITS_TYPES } from "./productUnits.types";

export const productUnitsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailProductUnitsRepository>(RETAIL_PRODUCT_UNITS_TYPES.Repository).to(RetailProductUnitsRepository);
  options.bind<RetailProductUnitsService>(RETAIL_PRODUCT_UNITS_TYPES.Service).to(RetailProductUnitsService);
  options.bind<RetailProductUnitsController>(RETAIL_PRODUCT_UNITS_TYPES.Controller).to(RetailProductUnitsController);
  options.bind<RetailProductUnitsRouter>(RETAIL_PRODUCT_UNITS_TYPES.Router).to(RetailProductUnitsRouter);
});
