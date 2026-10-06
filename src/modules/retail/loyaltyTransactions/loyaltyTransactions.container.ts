import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailLoyaltyTransactionsController } from "./loyaltyTransactions.controller";
import { RetailLoyaltyTransactionsRepository } from "./loyaltyTransactions.repository";
import { RetailLoyaltyTransactionsRouter } from "./loyaltyTransactions.route";
import { RetailLoyaltyTransactionsService } from "./loyaltyTransactions.service";
import { RETAIL_LOYALTY_TRANSACTIONS_TYPES } from "./loyaltyTransactions.types";

export const loyaltyTransactionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailLoyaltyTransactionsRepository>(RETAIL_LOYALTY_TRANSACTIONS_TYPES.Repository).to(RetailLoyaltyTransactionsRepository);
  options.bind<RetailLoyaltyTransactionsService>(RETAIL_LOYALTY_TRANSACTIONS_TYPES.Service).to(RetailLoyaltyTransactionsService);
  options.bind<RetailLoyaltyTransactionsController>(RETAIL_LOYALTY_TRANSACTIONS_TYPES.Controller).to(RetailLoyaltyTransactionsController);
  options.bind<RetailLoyaltyTransactionsRouter>(RETAIL_LOYALTY_TRANSACTIONS_TYPES.Router).to(RetailLoyaltyTransactionsRouter);
});
