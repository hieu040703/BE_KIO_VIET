import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailRolePermissionsController } from "./rolePermissions.controller";
import { RetailRolePermissionsRepository } from "./rolePermissions.repository";
import { RetailRolePermissionsRouter } from "./rolePermissions.route";
import { RetailRolePermissionsService } from "./rolePermissions.service";
import { RETAIL_ROLE_PERMISSIONS_TYPES } from "./rolePermissions.types";

export const rolePermissionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailRolePermissionsRepository>(RETAIL_ROLE_PERMISSIONS_TYPES.Repository).to(RetailRolePermissionsRepository);
  options.bind<RetailRolePermissionsService>(RETAIL_ROLE_PERMISSIONS_TYPES.Service).to(RetailRolePermissionsService);
  options.bind<RetailRolePermissionsController>(RETAIL_ROLE_PERMISSIONS_TYPES.Controller).to(RetailRolePermissionsController);
  options.bind<RetailRolePermissionsRouter>(RETAIL_ROLE_PERMISSIONS_TYPES.Router).to(RetailRolePermissionsRouter);
});
