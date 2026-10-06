import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCustomerGroupMembersController } from "./customerGroupMembers.controller";
import { RetailCustomerGroupMembersRepository } from "./customerGroupMembers.repository";
import { RetailCustomerGroupMembersRouter } from "./customerGroupMembers.route";
import { RetailCustomerGroupMembersService } from "./customerGroupMembers.service";
import { RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES } from "./customerGroupMembers.types";

export const customerGroupMembersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCustomerGroupMembersRepository>(RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES.Repository).to(RetailCustomerGroupMembersRepository);
  options.bind<RetailCustomerGroupMembersService>(RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES.Service).to(RetailCustomerGroupMembersService);
  options.bind<RetailCustomerGroupMembersController>(RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES.Controller).to(RetailCustomerGroupMembersController);
  options.bind<RetailCustomerGroupMembersRouter>(RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES.Router).to(RetailCustomerGroupMembersRouter);
});
