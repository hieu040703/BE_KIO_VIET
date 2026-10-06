import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailProductVariantsController } from "./productVariants.controller";
import { RetailProductVariantsRepository } from "./productVariants.repository";
import { RetailProductVariantsRouter } from "./productVariants.route";
import { RetailProductVariantsService } from "./productVariants.service";
import { RETAIL_PRODUCT_VARIANTS_TYPES } from "./productVariants.types";

export const productVariantsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailProductVariantsRepository>(RETAIL_PRODUCT_VARIANTS_TYPES.Repository).to(RetailProductVariantsRepository);
  options.bind<RetailProductVariantsService>(RETAIL_PRODUCT_VARIANTS_TYPES.Service).to(RetailProductVariantsService);
  options.bind<RetailProductVariantsController>(RETAIL_PRODUCT_VARIANTS_TYPES.Controller).to(RetailProductVariantsController);
  options.bind<RetailProductVariantsRouter>(RETAIL_PRODUCT_VARIANTS_TYPES.Router).to(RetailProductVariantsRouter);
});
