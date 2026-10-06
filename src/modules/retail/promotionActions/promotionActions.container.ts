import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPromotionActionsController } from "./promotionActions.controller";
import { RetailPromotionActionsRepository } from "./promotionActions.repository";
import { RetailPromotionActionsRouter } from "./promotionActions.route";
import { RetailPromotionActionsService } from "./promotionActions.service";
import { RETAIL_PROMOTION_ACTIONS_TYPES } from "./promotionActions.types";

export const promotionActionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPromotionActionsRepository>(RETAIL_PROMOTION_ACTIONS_TYPES.Repository).to(RetailPromotionActionsRepository);
  options.bind<RetailPromotionActionsService>(RETAIL_PROMOTION_ACTIONS_TYPES.Service).to(RetailPromotionActionsService);
  options.bind<RetailPromotionActionsController>(RETAIL_PROMOTION_ACTIONS_TYPES.Controller).to(RetailPromotionActionsController);
  options.bind<RetailPromotionActionsRouter>(RETAIL_PROMOTION_ACTIONS_TYPES.Router).to(RetailPromotionActionsRouter);
});
