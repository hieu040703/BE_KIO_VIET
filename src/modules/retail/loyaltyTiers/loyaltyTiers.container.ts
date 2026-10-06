import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailLoyaltyTiersController } from "./loyaltyTiers.controller";
import { RetailLoyaltyTiersRepository } from "./loyaltyTiers.repository";
import { RetailLoyaltyTiersRouter } from "./loyaltyTiers.route";
import { RetailLoyaltyTiersService } from "./loyaltyTiers.service";
import { RETAIL_LOYALTY_TIERS_TYPES } from "./loyaltyTiers.types";

export const loyaltyTiersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailLoyaltyTiersRepository>(RETAIL_LOYALTY_TIERS_TYPES.Repository).to(RetailLoyaltyTiersRepository);
  options.bind<RetailLoyaltyTiersService>(RETAIL_LOYALTY_TIERS_TYPES.Service).to(RetailLoyaltyTiersService);
  options.bind<RetailLoyaltyTiersController>(RETAIL_LOYALTY_TIERS_TYPES.Controller).to(RetailLoyaltyTiersController);
  options.bind<RetailLoyaltyTiersRouter>(RETAIL_LOYALTY_TIERS_TYPES.Router).to(RetailLoyaltyTiersRouter);
});
