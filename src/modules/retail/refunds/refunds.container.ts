import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailRefundsController } from "./refunds.controller";
import { RetailRefundsRepository } from "./refunds.repository";
import { RetailRefundsRouter } from "./refunds.route";
import { RetailRefundsService } from "./refunds.service";
import { RETAIL_REFUNDS_TYPES } from "./refunds.types";

export const refundsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailRefundsRepository>(RETAIL_REFUNDS_TYPES.Repository).to(RetailRefundsRepository);
  options.bind<RetailRefundsService>(RETAIL_REFUNDS_TYPES.Service).to(RetailRefundsService);
  options.bind<RetailRefundsController>(RETAIL_REFUNDS_TYPES.Controller).to(RetailRefundsController);
  options.bind<RetailRefundsRouter>(RETAIL_REFUNDS_TYPES.Router).to(RetailRefundsRouter);
});
