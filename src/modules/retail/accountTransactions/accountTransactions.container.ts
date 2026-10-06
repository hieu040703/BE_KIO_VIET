import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailAccountTransactionsController } from "./accountTransactions.controller";
import { RetailAccountTransactionsRepository } from "./accountTransactions.repository";
import { RetailAccountTransactionsRouter } from "./accountTransactions.route";
import { RetailAccountTransactionsService } from "./accountTransactions.service";
import { RETAIL_ACCOUNT_TRANSACTIONS_TYPES } from "./accountTransactions.types";

export const accountTransactionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailAccountTransactionsRepository>(RETAIL_ACCOUNT_TRANSACTIONS_TYPES.Repository).to(RetailAccountTransactionsRepository);
  options.bind<RetailAccountTransactionsService>(RETAIL_ACCOUNT_TRANSACTIONS_TYPES.Service).to(RetailAccountTransactionsService);
  options.bind<RetailAccountTransactionsController>(RETAIL_ACCOUNT_TRANSACTIONS_TYPES.Controller).to(RetailAccountTransactionsController);
  options.bind<RetailAccountTransactionsRouter>(RETAIL_ACCOUNT_TRANSACTIONS_TYPES.Router).to(RetailAccountTransactionsRouter);
});
