import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPurchaseOrderItemsController } from "./purchaseOrderItems.controller";
import { RetailPurchaseOrderItemsRepository } from "./purchaseOrderItems.repository";
import { RetailPurchaseOrderItemsRouter } from "./purchaseOrderItems.route";
import { RetailPurchaseOrderItemsService } from "./purchaseOrderItems.service";
import { RETAIL_PURCHASE_ORDER_ITEMS_TYPES } from "./purchaseOrderItems.types";

export const purchaseOrderItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPurchaseOrderItemsRepository>(RETAIL_PURCHASE_ORDER_ITEMS_TYPES.Repository).to(RetailPurchaseOrderItemsRepository);
  options.bind<RetailPurchaseOrderItemsService>(RETAIL_PURCHASE_ORDER_ITEMS_TYPES.Service).to(RetailPurchaseOrderItemsService);
  options.bind<RetailPurchaseOrderItemsController>(RETAIL_PURCHASE_ORDER_ITEMS_TYPES.Controller).to(RetailPurchaseOrderItemsController);
  options.bind<RetailPurchaseOrderItemsRouter>(RETAIL_PURCHASE_ORDER_ITEMS_TYPES.Router).to(RetailPurchaseOrderItemsRouter);
});
