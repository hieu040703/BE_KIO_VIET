import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailFinancialAccountsController } from "./financialAccounts.controller";
import { RetailFinancialAccountsRepository } from "./financialAccounts.repository";
import { RetailFinancialAccountsRouter } from "./financialAccounts.route";
import { RetailFinancialAccountsService } from "./financialAccounts.service";
import { RETAIL_FINANCIAL_ACCOUNTS_TYPES } from "./financialAccounts.types";

export const financialAccountsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailFinancialAccountsRepository>(RETAIL_FINANCIAL_ACCOUNTS_TYPES.Repository).to(RetailFinancialAccountsRepository);
  options.bind<RetailFinancialAccountsService>(RETAIL_FINANCIAL_ACCOUNTS_TYPES.Service).to(RetailFinancialAccountsService);
  options.bind<RetailFinancialAccountsController>(RETAIL_FINANCIAL_ACCOUNTS_TYPES.Controller).to(RetailFinancialAccountsController);
  options.bind<RetailFinancialAccountsRouter>(RETAIL_FINANCIAL_ACCOUNTS_TYPES.Router).to(RetailFinancialAccountsRouter);
});
