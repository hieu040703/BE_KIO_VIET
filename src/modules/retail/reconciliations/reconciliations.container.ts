import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailReconciliationsController } from "./reconciliations.controller";
import { RetailReconciliationsRepository } from "./reconciliations.repository";
import { RetailReconciliationsRouter } from "./reconciliations.route";
import { RetailReconciliationsService } from "./reconciliations.service";
import { RETAIL_RECONCILIATIONS_TYPES } from "./reconciliations.types";

export const reconciliationsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailReconciliationsRepository>(RETAIL_RECONCILIATIONS_TYPES.Repository).to(RetailReconciliationsRepository);
  options.bind<RetailReconciliationsService>(RETAIL_RECONCILIATIONS_TYPES.Service).to(RetailReconciliationsService);
  options.bind<RetailReconciliationsController>(RETAIL_RECONCILIATIONS_TYPES.Controller).to(RetailReconciliationsController);
  options.bind<RetailReconciliationsRouter>(RETAIL_RECONCILIATIONS_TYPES.Router).to(RetailReconciliationsRouter);
});
