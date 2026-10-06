import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailUnitsController } from "./units.controller";
import { RetailUnitsRepository } from "./units.repository";
import { RetailUnitsRouter } from "./units.route";
import { RetailUnitsService } from "./units.service";
import { RETAIL_UNITS_TYPES } from "./units.types";

export const unitsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailUnitsRepository>(RETAIL_UNITS_TYPES.Repository).to(RetailUnitsRepository);
  options.bind<RetailUnitsService>(RETAIL_UNITS_TYPES.Service).to(RetailUnitsService);
  options.bind<RetailUnitsController>(RETAIL_UNITS_TYPES.Controller).to(RetailUnitsController);
  options.bind<RetailUnitsRouter>(RETAIL_UNITS_TYPES.Router).to(RetailUnitsRouter);
});
