import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailStockAdjustmentsController } from "./stockAdjustments.controller";
import { RetailStockAdjustmentsRepository } from "./stockAdjustments.repository";
import { RetailStockAdjustmentsRouter } from "./stockAdjustments.route";
import { RetailStockAdjustmentsService } from "./stockAdjustments.service";
import { RETAIL_STOCK_ADJUSTMENTS_TYPES } from "./stockAdjustments.types";

export const stockAdjustmentsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailStockAdjustmentsRepository>(RETAIL_STOCK_ADJUSTMENTS_TYPES.Repository).to(RetailStockAdjustmentsRepository);
  options.bind<RetailStockAdjustmentsService>(RETAIL_STOCK_ADJUSTMENTS_TYPES.Service).to(RetailStockAdjustmentsService);
  options.bind<RetailStockAdjustmentsController>(RETAIL_STOCK_ADJUSTMENTS_TYPES.Controller).to(RetailStockAdjustmentsController);
  options.bind<RetailStockAdjustmentsRouter>(RETAIL_STOCK_ADJUSTMENTS_TYPES.Router).to(RetailStockAdjustmentsRouter);
});
