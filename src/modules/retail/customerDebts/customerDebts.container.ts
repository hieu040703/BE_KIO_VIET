import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCustomerDebtsController } from "./customerDebts.controller";
import { RetailCustomerDebtsRepository } from "./customerDebts.repository";
import { RetailCustomerDebtsRouter } from "./customerDebts.route";
import { RetailCustomerDebtsService } from "./customerDebts.service";
import { RETAIL_CUSTOMER_DEBTS_TYPES } from "./customerDebts.types";

export const customerDebtsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCustomerDebtsRepository>(RETAIL_CUSTOMER_DEBTS_TYPES.Repository).to(RetailCustomerDebtsRepository);
  options.bind<RetailCustomerDebtsService>(RETAIL_CUSTOMER_DEBTS_TYPES.Service).to(RetailCustomerDebtsService);
  options.bind<RetailCustomerDebtsController>(RETAIL_CUSTOMER_DEBTS_TYPES.Controller).to(RetailCustomerDebtsController);
  options.bind<RetailCustomerDebtsRouter>(RETAIL_CUSTOMER_DEBTS_TYPES.Router).to(RetailCustomerDebtsRouter);
});
