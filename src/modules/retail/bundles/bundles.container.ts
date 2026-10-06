import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailBundlesController } from "./bundles.controller";
import { RetailBundlesRepository } from "./bundles.repository";
import { RetailBundlesRouter } from "./bundles.route";
import { RetailBundlesService } from "./bundles.service";
import { RETAIL_BUNDLES_TYPES } from "./bundles.types";

export const bundlesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailBundlesRepository>(RETAIL_BUNDLES_TYPES.Repository).to(RetailBundlesRepository);
  options.bind<RetailBundlesService>(RETAIL_BUNDLES_TYPES.Service).to(RetailBundlesService);
  options.bind<RetailBundlesController>(RETAIL_BUNDLES_TYPES.Controller).to(RetailBundlesController);
  options.bind<RetailBundlesRouter>(RETAIL_BUNDLES_TYPES.Router).to(RetailBundlesRouter);
});
