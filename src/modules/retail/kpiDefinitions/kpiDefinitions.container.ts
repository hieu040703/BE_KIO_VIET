import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailKpiDefinitionsController } from "./kpiDefinitions.controller";
import { RetailKpiDefinitionsRepository } from "./kpiDefinitions.repository";
import { RetailKpiDefinitionsRouter } from "./kpiDefinitions.route";
import { RetailKpiDefinitionsService } from "./kpiDefinitions.service";
import { RETAIL_KPI_DEFINITIONS_TYPES } from "./kpiDefinitions.types";

export const kpiDefinitionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailKpiDefinitionsRepository>(RETAIL_KPI_DEFINITIONS_TYPES.Repository).to(RetailKpiDefinitionsRepository);
  options.bind<RetailKpiDefinitionsService>(RETAIL_KPI_DEFINITIONS_TYPES.Service).to(RetailKpiDefinitionsService);
  options.bind<RetailKpiDefinitionsController>(RETAIL_KPI_DEFINITIONS_TYPES.Controller).to(RetailKpiDefinitionsController);
  options.bind<RetailKpiDefinitionsRouter>(RETAIL_KPI_DEFINITIONS_TYPES.Router).to(RetailKpiDefinitionsRouter);
});
