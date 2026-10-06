import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailOrderDiscountsController } from "./orderDiscounts.controller";
import { RetailOrderDiscountsRepository } from "./orderDiscounts.repository";
import { RetailOrderDiscountsRouter } from "./orderDiscounts.route";
import { RetailOrderDiscountsService } from "./orderDiscounts.service";
import { RETAIL_ORDER_DISCOUNTS_TYPES } from "./orderDiscounts.types";

export const orderDiscountsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailOrderDiscountsRepository>(RETAIL_ORDER_DISCOUNTS_TYPES.Repository).to(RetailOrderDiscountsRepository);
  options.bind<RetailOrderDiscountsService>(RETAIL_ORDER_DISCOUNTS_TYPES.Service).to(RetailOrderDiscountsService);
  options.bind<RetailOrderDiscountsController>(RETAIL_ORDER_DISCOUNTS_TYPES.Controller).to(RetailOrderDiscountsController);
  options.bind<RetailOrderDiscountsRouter>(RETAIL_ORDER_DISCOUNTS_TYPES.Router).to(RetailOrderDiscountsRouter);
});
