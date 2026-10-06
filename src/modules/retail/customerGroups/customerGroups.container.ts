import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCustomerGroupsController } from "./customerGroups.controller";
import { RetailCustomerGroupsRepository } from "./customerGroups.repository";
import { RetailCustomerGroupsRouter } from "./customerGroups.route";
import { RetailCustomerGroupsService } from "./customerGroups.service";
import { RETAIL_CUSTOMER_GROUPS_TYPES } from "./customerGroups.types";

export const customerGroupsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCustomerGroupsRepository>(RETAIL_CUSTOMER_GROUPS_TYPES.Repository).to(RetailCustomerGroupsRepository);
  options.bind<RetailCustomerGroupsService>(RETAIL_CUSTOMER_GROUPS_TYPES.Service).to(RetailCustomerGroupsService);
  options.bind<RetailCustomerGroupsController>(RETAIL_CUSTOMER_GROUPS_TYPES.Controller).to(RetailCustomerGroupsController);
  options.bind<RetailCustomerGroupsRouter>(RETAIL_CUSTOMER_GROUPS_TYPES.Router).to(RetailCustomerGroupsRouter);
});
