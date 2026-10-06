import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCustomerDebtTransactionsController } from "./customerDebtTransactions.controller";
import { RetailCustomerDebtTransactionsRepository } from "./customerDebtTransactions.repository";
import { RetailCustomerDebtTransactionsRouter } from "./customerDebtTransactions.route";
import { RetailCustomerDebtTransactionsService } from "./customerDebtTransactions.service";
import { RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES } from "./customerDebtTransactions.types";

export const customerDebtTransactionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCustomerDebtTransactionsRepository>(RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES.Repository).to(RetailCustomerDebtTransactionsRepository);
  options.bind<RetailCustomerDebtTransactionsService>(RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES.Service).to(RetailCustomerDebtTransactionsService);
  options.bind<RetailCustomerDebtTransactionsController>(RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES.Controller).to(RetailCustomerDebtTransactionsController);
  options.bind<RetailCustomerDebtTransactionsRouter>(RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES.Router).to(RetailCustomerDebtTransactionsRouter);
});
