import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailFulfillmentItemsController } from "./fulfillmentItems.controller";
import { RetailFulfillmentItemsRepository } from "./fulfillmentItems.repository";
import { RetailFulfillmentItemsRouter } from "./fulfillmentItems.route";
import { RetailFulfillmentItemsService } from "./fulfillmentItems.service";
import { RETAIL_FULFILLMENT_ITEMS_TYPES } from "./fulfillmentItems.types";

export const fulfillmentItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailFulfillmentItemsRepository>(RETAIL_FULFILLMENT_ITEMS_TYPES.Repository).to(RetailFulfillmentItemsRepository);
  options.bind<RetailFulfillmentItemsService>(RETAIL_FULFILLMENT_ITEMS_TYPES.Service).to(RetailFulfillmentItemsService);
  options.bind<RetailFulfillmentItemsController>(RETAIL_FULFILLMENT_ITEMS_TYPES.Controller).to(RetailFulfillmentItemsController);
  options.bind<RetailFulfillmentItemsRouter>(RETAIL_FULFILLMENT_ITEMS_TYPES.Router).to(RetailFulfillmentItemsRouter);
});
