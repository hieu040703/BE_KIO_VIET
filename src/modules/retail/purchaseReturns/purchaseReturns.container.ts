import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPurchaseReturnsController } from "./purchaseReturns.controller";
import { RetailPurchaseReturnsRepository } from "./purchaseReturns.repository";
import { RetailPurchaseReturnsRouter } from "./purchaseReturns.route";
import { RetailPurchaseReturnsService } from "./purchaseReturns.service";
import { RETAIL_PURCHASE_RETURNS_TYPES } from "./purchaseReturns.types";

export const purchaseReturnsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPurchaseReturnsRepository>(RETAIL_PURCHASE_RETURNS_TYPES.Repository).to(RetailPurchaseReturnsRepository);
  options.bind<RetailPurchaseReturnsService>(RETAIL_PURCHASE_RETURNS_TYPES.Service).to(RetailPurchaseReturnsService);
  options.bind<RetailPurchaseReturnsController>(RETAIL_PURCHASE_RETURNS_TYPES.Controller).to(RetailPurchaseReturnsController);
  options.bind<RetailPurchaseReturnsRouter>(RETAIL_PURCHASE_RETURNS_TYPES.Router).to(RetailPurchaseReturnsRouter);
});
