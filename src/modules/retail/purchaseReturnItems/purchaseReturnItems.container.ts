import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPurchaseReturnItemsController } from "./purchaseReturnItems.controller";
import { RetailPurchaseReturnItemsRepository } from "./purchaseReturnItems.repository";
import { RetailPurchaseReturnItemsRouter } from "./purchaseReturnItems.route";
import { RetailPurchaseReturnItemsService } from "./purchaseReturnItems.service";
import { RETAIL_PURCHASE_RETURN_ITEMS_TYPES } from "./purchaseReturnItems.types";

export const purchaseReturnItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPurchaseReturnItemsRepository>(RETAIL_PURCHASE_RETURN_ITEMS_TYPES.Repository).to(RetailPurchaseReturnItemsRepository);
  options.bind<RetailPurchaseReturnItemsService>(RETAIL_PURCHASE_RETURN_ITEMS_TYPES.Service).to(RetailPurchaseReturnItemsService);
  options.bind<RetailPurchaseReturnItemsController>(RETAIL_PURCHASE_RETURN_ITEMS_TYPES.Controller).to(RetailPurchaseReturnItemsController);
  options.bind<RetailPurchaseReturnItemsRouter>(RETAIL_PURCHASE_RETURN_ITEMS_TYPES.Router).to(RetailPurchaseReturnItemsRouter);
});
