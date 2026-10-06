import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailReturnItemsController } from "./returnItems.controller";
import { RetailReturnItemsRepository } from "./returnItems.repository";
import { RetailReturnItemsRouter } from "./returnItems.route";
import { RetailReturnItemsService } from "./returnItems.service";
import { RETAIL_RETURN_ITEMS_TYPES } from "./returnItems.types";

export const returnItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailReturnItemsRepository>(RETAIL_RETURN_ITEMS_TYPES.Repository).to(RetailReturnItemsRepository);
  options.bind<RetailReturnItemsService>(RETAIL_RETURN_ITEMS_TYPES.Service).to(RetailReturnItemsService);
  options.bind<RetailReturnItemsController>(RETAIL_RETURN_ITEMS_TYPES.Controller).to(RetailReturnItemsController);
  options.bind<RetailReturnItemsRouter>(RETAIL_RETURN_ITEMS_TYPES.Router).to(RetailReturnItemsRouter);
});
