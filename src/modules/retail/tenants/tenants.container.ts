import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailTenantsController } from "./tenants.controller";
import { RetailTenantsRepository } from "./tenants.repository";
import { RetailTenantsRouter } from "./tenants.route";
import { RetailTenantsService } from "./tenants.service";
import { RETAIL_TENANTS_TYPES } from "./tenants.types";

export const tenantsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailTenantsRepository>(RETAIL_TENANTS_TYPES.Repository).to(RetailTenantsRepository);
  options.bind<RetailTenantsService>(RETAIL_TENANTS_TYPES.Service).to(RetailTenantsService);
  options.bind<RetailTenantsController>(RETAIL_TENANTS_TYPES.Controller).to(RetailTenantsController);
  options.bind<RetailTenantsRouter>(RETAIL_TENANTS_TYPES.Router).to(RetailTenantsRouter);
});
