import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPromotionsController } from "./promotions.controller";
import { RetailPromotionsRepository } from "./promotions.repository";
import { RetailPromotionsRouter } from "./promotions.route";
import { RetailPromotionsService } from "./promotions.service";
import { RETAIL_PROMOTIONS_TYPES } from "./promotions.types";

export const promotionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPromotionsRepository>(RETAIL_PROMOTIONS_TYPES.Repository).to(RetailPromotionsRepository);
  options.bind<RetailPromotionsService>(RETAIL_PROMOTIONS_TYPES.Service).to(RetailPromotionsService);
  options.bind<RetailPromotionsController>(RETAIL_PROMOTIONS_TYPES.Controller).to(RetailPromotionsController);
  options.bind<RetailPromotionsRouter>(RETAIL_PROMOTIONS_TYPES.Router).to(RetailPromotionsRouter);
});
