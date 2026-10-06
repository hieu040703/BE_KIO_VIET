import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailLoyaltyAccountsController } from "./loyaltyAccounts.controller";
import { RetailLoyaltyAccountsRepository } from "./loyaltyAccounts.repository";
import { RetailLoyaltyAccountsRouter } from "./loyaltyAccounts.route";
import { RetailLoyaltyAccountsService } from "./loyaltyAccounts.service";
import { RETAIL_LOYALTY_ACCOUNTS_TYPES } from "./loyaltyAccounts.types";

export const loyaltyAccountsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailLoyaltyAccountsRepository>(RETAIL_LOYALTY_ACCOUNTS_TYPES.Repository).to(RetailLoyaltyAccountsRepository);
  options.bind<RetailLoyaltyAccountsService>(RETAIL_LOYALTY_ACCOUNTS_TYPES.Service).to(RetailLoyaltyAccountsService);
  options.bind<RetailLoyaltyAccountsController>(RETAIL_LOYALTY_ACCOUNTS_TYPES.Controller).to(RetailLoyaltyAccountsController);
  options.bind<RetailLoyaltyAccountsRouter>(RETAIL_LOYALTY_ACCOUNTS_TYPES.Router).to(RetailLoyaltyAccountsRouter);
});
