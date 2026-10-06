import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailReceiptsController } from "./receipts.controller";
import { RetailReceiptsRepository } from "./receipts.repository";
import { RetailReceiptsRouter } from "./receipts.route";
import { RetailReceiptsService } from "./receipts.service";
import { RETAIL_RECEIPTS_TYPES } from "./receipts.types";

export const receiptsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailReceiptsRepository>(RETAIL_RECEIPTS_TYPES.Repository).to(RetailReceiptsRepository);
  options.bind<RetailReceiptsService>(RETAIL_RECEIPTS_TYPES.Service).to(RetailReceiptsService);
  options.bind<RetailReceiptsController>(RETAIL_RECEIPTS_TYPES.Controller).to(RetailReceiptsController);
  options.bind<RetailReceiptsRouter>(RETAIL_RECEIPTS_TYPES.Router).to(RetailReceiptsRouter);
});
