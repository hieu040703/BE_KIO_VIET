import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailUserRolesController } from "./userRoles.controller";
import { RetailUserRolesRepository } from "./userRoles.repository";
import { RetailUserRolesRouter } from "./userRoles.route";
import { RetailUserRolesService } from "./userRoles.service";
import { RETAIL_USER_ROLES_TYPES } from "./userRoles.types";

export const userRolesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailUserRolesRepository>(RETAIL_USER_ROLES_TYPES.Repository).to(RetailUserRolesRepository);
  options.bind<RetailUserRolesService>(RETAIL_USER_ROLES_TYPES.Service).to(RetailUserRolesService);
  options.bind<RetailUserRolesController>(RETAIL_USER_ROLES_TYPES.Controller).to(RetailUserRolesController);
  options.bind<RetailUserRolesRouter>(RETAIL_USER_ROLES_TYPES.Router).to(RetailUserRolesRouter);
});
