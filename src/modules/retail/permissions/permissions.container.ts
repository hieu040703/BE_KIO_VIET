import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPermissionsController } from "./permissions.controller";
import { RetailPermissionsRepository } from "./permissions.repository";
import { RetailPermissionsRouter } from "./permissions.route";
import { RetailPermissionsService } from "./permissions.service";
import { RETAIL_PERMISSIONS_TYPES } from "./permissions.types";

export const permissionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPermissionsRepository>(RETAIL_PERMISSIONS_TYPES.Repository).to(RetailPermissionsRepository);
  options.bind<RetailPermissionsService>(RETAIL_PERMISSIONS_TYPES.Service).to(RetailPermissionsService);
  options.bind<RetailPermissionsController>(RETAIL_PERMISSIONS_TYPES.Controller).to(RetailPermissionsController);
  options.bind<RetailPermissionsRouter>(RETAIL_PERMISSIONS_TYPES.Router).to(RetailPermissionsRouter);
});
