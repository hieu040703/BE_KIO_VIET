import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPenaltiesController } from "./penalties.controller";
import { RetailPenaltiesRepository } from "./penalties.repository";
import { RetailPenaltiesRouter } from "./penalties.route";
import { RetailPenaltiesService } from "./penalties.service";
import { RETAIL_PENALTIES_TYPES } from "./penalties.types";

export const penaltiesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPenaltiesRepository>(RETAIL_PENALTIES_TYPES.Repository).to(RetailPenaltiesRepository);
  options.bind<RetailPenaltiesService>(RETAIL_PENALTIES_TYPES.Service).to(RetailPenaltiesService);
  options.bind<RetailPenaltiesController>(RETAIL_PENALTIES_TYPES.Controller).to(RetailPenaltiesController);
  options.bind<RetailPenaltiesRouter>(RETAIL_PENALTIES_TYPES.Router).to(RetailPenaltiesRouter);
});
