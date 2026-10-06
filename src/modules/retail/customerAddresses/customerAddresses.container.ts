import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCustomerAddressesController } from "./customerAddresses.controller";
import { RetailCustomerAddressesRepository } from "./customerAddresses.repository";
import { RetailCustomerAddressesRouter } from "./customerAddresses.route";
import { RetailCustomerAddressesService } from "./customerAddresses.service";
import { RETAIL_CUSTOMER_ADDRESSES_TYPES } from "./customerAddresses.types";

export const customerAddressesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCustomerAddressesRepository>(RETAIL_CUSTOMER_ADDRESSES_TYPES.Repository).to(RetailCustomerAddressesRepository);
  options.bind<RetailCustomerAddressesService>(RETAIL_CUSTOMER_ADDRESSES_TYPES.Service).to(RetailCustomerAddressesService);
  options.bind<RetailCustomerAddressesController>(RETAIL_CUSTOMER_ADDRESSES_TYPES.Controller).to(RetailCustomerAddressesController);
  options.bind<RetailCustomerAddressesRouter>(RETAIL_CUSTOMER_ADDRESSES_TYPES.Router).to(RetailCustomerAddressesRouter);
});
