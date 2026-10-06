import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailShipmentItemsController } from "./shipmentItems.controller";
import { RetailShipmentItemsRepository } from "./shipmentItems.repository";
import { RetailShipmentItemsRouter } from "./shipmentItems.route";
import { RetailShipmentItemsService } from "./shipmentItems.service";
import { RETAIL_SHIPMENT_ITEMS_TYPES } from "./shipmentItems.types";

export const shipmentItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailShipmentItemsRepository>(RETAIL_SHIPMENT_ITEMS_TYPES.Repository).to(RetailShipmentItemsRepository);
  options.bind<RetailShipmentItemsService>(RETAIL_SHIPMENT_ITEMS_TYPES.Service).to(RetailShipmentItemsService);
  options.bind<RetailShipmentItemsController>(RETAIL_SHIPMENT_ITEMS_TYPES.Controller).to(RetailShipmentItemsController);
  options.bind<RetailShipmentItemsRouter>(RETAIL_SHIPMENT_ITEMS_TYPES.Router).to(RetailShipmentItemsRouter);
});
