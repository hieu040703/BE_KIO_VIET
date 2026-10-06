import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPromotionProductsController } from "./promotionProducts.controller";
import { RetailPromotionProductsRepository } from "./promotionProducts.repository";
import { RetailPromotionProductsRouter } from "./promotionProducts.route";
import { RetailPromotionProductsService } from "./promotionProducts.service";
import { RETAIL_PROMOTION_PRODUCTS_TYPES } from "./promotionProducts.types";

export const promotionProductsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPromotionProductsRepository>(RETAIL_PROMOTION_PRODUCTS_TYPES.Repository).to(RetailPromotionProductsRepository);
  options.bind<RetailPromotionProductsService>(RETAIL_PROMOTION_PRODUCTS_TYPES.Service).to(RetailPromotionProductsService);
  options.bind<RetailPromotionProductsController>(RETAIL_PROMOTION_PRODUCTS_TYPES.Controller).to(RetailPromotionProductsController);
  options.bind<RetailPromotionProductsRouter>(RETAIL_PROMOTION_PRODUCTS_TYPES.Router).to(RetailPromotionProductsRouter);
});
