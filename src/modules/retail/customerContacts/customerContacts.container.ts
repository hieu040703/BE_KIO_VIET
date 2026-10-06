import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCustomerContactsController } from "./customerContacts.controller";
import { RetailCustomerContactsRepository } from "./customerContacts.repository";
import { RetailCustomerContactsRouter } from "./customerContacts.route";
import { RetailCustomerContactsService } from "./customerContacts.service";
import { RETAIL_CUSTOMER_CONTACTS_TYPES } from "./customerContacts.types";

export const customerContactsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCustomerContactsRepository>(RETAIL_CUSTOMER_CONTACTS_TYPES.Repository).to(RetailCustomerContactsRepository);
  options.bind<RetailCustomerContactsService>(RETAIL_CUSTOMER_CONTACTS_TYPES.Service).to(RetailCustomerContactsService);
  options.bind<RetailCustomerContactsController>(RETAIL_CUSTOMER_CONTACTS_TYPES.Controller).to(RetailCustomerContactsController);
  options.bind<RetailCustomerContactsRouter>(RETAIL_CUSTOMER_CONTACTS_TYPES.Router).to(RetailCustomerContactsRouter);
});
