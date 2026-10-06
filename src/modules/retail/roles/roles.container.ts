import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailRolesController } from "./roles.controller";
import { RetailRolesRepository } from "./roles.repository";
import { RetailRolesRouter } from "./roles.route";
import { RetailRolesService } from "./roles.service";
import { RETAIL_ROLES_TYPES } from "./roles.types";

export const rolesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailRolesRepository>(RETAIL_ROLES_TYPES.Repository).to(RetailRolesRepository);
  options.bind<RetailRolesService>(RETAIL_ROLES_TYPES.Service).to(RetailRolesService);
  options.bind<RetailRolesController>(RETAIL_ROLES_TYPES.Controller).to(RetailRolesController);
  options.bind<RetailRolesRouter>(RETAIL_ROLES_TYPES.Router).to(RetailRolesRouter);
});
