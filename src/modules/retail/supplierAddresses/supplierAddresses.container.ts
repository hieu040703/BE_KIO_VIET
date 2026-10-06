import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailSupplierAddressesController } from "./supplierAddresses.controller";
import { RetailSupplierAddressesRepository } from "./supplierAddresses.repository";
import { RetailSupplierAddressesRouter } from "./supplierAddresses.route";
import { RetailSupplierAddressesService } from "./supplierAddresses.service";
import { RETAIL_SUPPLIER_ADDRESSES_TYPES } from "./supplierAddresses.types";

export const supplierAddressesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailSupplierAddressesRepository>(RETAIL_SUPPLIER_ADDRESSES_TYPES.Repository).to(RetailSupplierAddressesRepository);
  options.bind<RetailSupplierAddressesService>(RETAIL_SUPPLIER_ADDRESSES_TYPES.Service).to(RetailSupplierAddressesService);
  options.bind<RetailSupplierAddressesController>(RETAIL_SUPPLIER_ADDRESSES_TYPES.Controller).to(RetailSupplierAddressesController);
  options.bind<RetailSupplierAddressesRouter>(RETAIL_SUPPLIER_ADDRESSES_TYPES.Router).to(RetailSupplierAddressesRouter);
});
