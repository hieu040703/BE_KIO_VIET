import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailRefundItemsController } from "./refundItems.controller";
import { RetailRefundItemsRepository } from "./refundItems.repository";
import { RetailRefundItemsRouter } from "./refundItems.route";
import { RetailRefundItemsService } from "./refundItems.service";
import { RETAIL_REFUND_ITEMS_TYPES } from "./refundItems.types";

export const refundItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailRefundItemsRepository>(RETAIL_REFUND_ITEMS_TYPES.Repository).to(RetailRefundItemsRepository);
  options.bind<RetailRefundItemsService>(RETAIL_REFUND_ITEMS_TYPES.Service).to(RetailRefundItemsService);
  options.bind<RetailRefundItemsController>(RETAIL_REFUND_ITEMS_TYPES.Controller).to(RetailRefundItemsController);
  options.bind<RetailRefundItemsRouter>(RETAIL_REFUND_ITEMS_TYPES.Router).to(RetailRefundItemsRouter);
});
