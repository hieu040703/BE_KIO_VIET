import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailBranchesController } from "./branches.controller";
import { RetailBranchesRepository } from "./branches.repository";
import { RetailBranchesRouter } from "./branches.route";
import { RetailBranchesService } from "./branches.service";
import { RETAIL_BRANCHES_TYPES } from "./branches.types";

export const branchesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailBranchesRepository>(RETAIL_BRANCHES_TYPES.Repository).to(RetailBranchesRepository);
  options.bind<RetailBranchesService>(RETAIL_BRANCHES_TYPES.Service).to(RetailBranchesService);
  options.bind<RetailBranchesController>(RETAIL_BRANCHES_TYPES.Controller).to(RetailBranchesController);
  options.bind<RetailBranchesRouter>(RETAIL_BRANCHES_TYPES.Router).to(RetailBranchesRouter);
});
