import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { CustomerController } from "./customer.controller";
import { CustomerService } from "./customer.service";
import { CustomerRepository } from "./customer.repository";
import { CustomerRouter } from "./customer.route";
import { CUSTOMER_TYPES } from "./customer.types";
import { ClientCustomerRouter } from "./client.customer.route";

const customerModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<CustomerService>(CUSTOMER_TYPES.CustomerService).to(CustomerService);
  options.bind<CustomerController>(CUSTOMER_TYPES.CustomerController).to(CustomerController);
  options.bind<CustomerRepository>(CUSTOMER_TYPES.CustomerRepository).to(CustomerRepository);
  options.bind<CustomerRouter>(CUSTOMER_TYPES.CustomerRouter).to(CustomerRouter);
  options.bind<ClientCustomerRouter>(CUSTOMER_TYPES.ClientCustomerRouter).to(ClientCustomerRouter);
});

export { customerModule };
