import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailBrandsController } from "./brands.controller";
import { RetailBrandsRepository } from "./brands.repository";
import { RetailBrandsRouter } from "./brands.route";
import { RetailBrandsService } from "./brands.service";
import { RETAIL_BRANDS_TYPES } from "./brands.types";

export const brandsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailBrandsRepository>(RETAIL_BRANDS_TYPES.Repository).to(RetailBrandsRepository);
  options.bind<RetailBrandsService>(RETAIL_BRANDS_TYPES.Service).to(RetailBrandsService);
  options.bind<RetailBrandsController>(RETAIL_BRANDS_TYPES.Controller).to(RetailBrandsController);
  options.bind<RetailBrandsRouter>(RETAIL_BRANDS_TYPES.Router).to(RetailBrandsRouter);
});
