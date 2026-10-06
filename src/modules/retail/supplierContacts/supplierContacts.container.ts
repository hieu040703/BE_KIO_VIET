import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailSupplierContactsController } from "./supplierContacts.controller";
import { RetailSupplierContactsRepository } from "./supplierContacts.repository";
import { RetailSupplierContactsRouter } from "./supplierContacts.route";
import { RetailSupplierContactsService } from "./supplierContacts.service";
import { RETAIL_SUPPLIER_CONTACTS_TYPES } from "./supplierContacts.types";

export const supplierContactsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailSupplierContactsRepository>(RETAIL_SUPPLIER_CONTACTS_TYPES.Repository).to(RetailSupplierContactsRepository);
  options.bind<RetailSupplierContactsService>(RETAIL_SUPPLIER_CONTACTS_TYPES.Service).to(RetailSupplierContactsService);
  options.bind<RetailSupplierContactsController>(RETAIL_SUPPLIER_CONTACTS_TYPES.Controller).to(RetailSupplierContactsController);
  options.bind<RetailSupplierContactsRouter>(RETAIL_SUPPLIER_CONTACTS_TYPES.Router).to(RetailSupplierContactsRouter);
});
