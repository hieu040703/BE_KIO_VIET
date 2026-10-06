import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCustomersController } from "./customers.controller";
import { RetailCustomersRepository } from "./customers.repository";
import { RetailCustomersRouter } from "./customers.route";
import { RetailCustomersService } from "./customers.service";
import { RETAIL_CUSTOMERS_TYPES } from "./customers.types";

export const customersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCustomersRepository>(RETAIL_CUSTOMERS_TYPES.Repository).to(RetailCustomersRepository);
  options.bind<RetailCustomersService>(RETAIL_CUSTOMERS_TYPES.Service).to(RetailCustomersService);
  options.bind<RetailCustomersController>(RETAIL_CUSTOMERS_TYPES.Controller).to(RetailCustomersController);
  options.bind<RetailCustomersRouter>(RETAIL_CUSTOMERS_TYPES.Router).to(RetailCustomersRouter);
});
