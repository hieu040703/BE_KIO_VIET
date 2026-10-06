import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPurchaseOrdersController } from "./purchaseOrders.controller";
import { RetailPurchaseOrdersRepository } from "./purchaseOrders.repository";
import { RetailPurchaseOrdersRouter } from "./purchaseOrders.route";
import { RetailPurchaseOrdersService } from "./purchaseOrders.service";
import { RETAIL_PURCHASE_ORDERS_TYPES } from "./purchaseOrders.types";

export const purchaseOrdersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPurchaseOrdersRepository>(RETAIL_PURCHASE_ORDERS_TYPES.Repository).to(RetailPurchaseOrdersRepository);
  options.bind<RetailPurchaseOrdersService>(RETAIL_PURCHASE_ORDERS_TYPES.Service).to(RetailPurchaseOrdersService);
  options.bind<RetailPurchaseOrdersController>(RETAIL_PURCHASE_ORDERS_TYPES.Controller).to(RetailPurchaseOrdersController);
  options.bind<RetailPurchaseOrdersRouter>(RETAIL_PURCHASE_ORDERS_TYPES.Router).to(RetailPurchaseOrdersRouter);
});
