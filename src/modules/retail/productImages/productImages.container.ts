import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailProductImagesController } from "./productImages.controller";
import { RetailProductImagesRepository } from "./productImages.repository";
import { RetailProductImagesRouter } from "./productImages.route";
import { RetailProductImagesService } from "./productImages.service";
import { RETAIL_PRODUCT_IMAGES_TYPES } from "./productImages.types";

export const productImagesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailProductImagesRepository>(RETAIL_PRODUCT_IMAGES_TYPES.Repository).to(RetailProductImagesRepository);
  options.bind<RetailProductImagesService>(RETAIL_PRODUCT_IMAGES_TYPES.Service).to(RetailProductImagesService);
  options.bind<RetailProductImagesController>(RETAIL_PRODUCT_IMAGES_TYPES.Controller).to(RetailProductImagesController);
  options.bind<RetailProductImagesRouter>(RETAIL_PRODUCT_IMAGES_TYPES.Router).to(RetailProductImagesRouter);
});
