import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailBundleItemsController } from "./bundleItems.controller";
import { RetailBundleItemsRepository } from "./bundleItems.repository";
import { RetailBundleItemsRouter } from "./bundleItems.route";
import { RetailBundleItemsService } from "./bundleItems.service";
import { RETAIL_BUNDLE_ITEMS_TYPES } from "./bundleItems.types";

export const bundleItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailBundleItemsRepository>(RETAIL_BUNDLE_ITEMS_TYPES.Repository).to(RetailBundleItemsRepository);
  options.bind<RetailBundleItemsService>(RETAIL_BUNDLE_ITEMS_TYPES.Service).to(RetailBundleItemsService);
  options.bind<RetailBundleItemsController>(RETAIL_BUNDLE_ITEMS_TYPES.Controller).to(RetailBundleItemsController);
  options.bind<RetailBundleItemsRouter>(RETAIL_BUNDLE_ITEMS_TYPES.Router).to(RetailBundleItemsRouter);
});
