import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPromotionCustomerGroupsController } from "./promotionCustomerGroups.controller";
import { RetailPromotionCustomerGroupsRepository } from "./promotionCustomerGroups.repository";
import { RetailPromotionCustomerGroupsRouter } from "./promotionCustomerGroups.route";
import { RetailPromotionCustomerGroupsService } from "./promotionCustomerGroups.service";
import { RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES } from "./promotionCustomerGroups.types";

export const promotionCustomerGroupsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPromotionCustomerGroupsRepository>(RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES.Repository).to(RetailPromotionCustomerGroupsRepository);
  options.bind<RetailPromotionCustomerGroupsService>(RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES.Service).to(RetailPromotionCustomerGroupsService);
  options.bind<RetailPromotionCustomerGroupsController>(RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES.Controller).to(RetailPromotionCustomerGroupsController);
  options.bind<RetailPromotionCustomerGroupsRouter>(RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES.Router).to(RetailPromotionCustomerGroupsRouter);
});
