import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCashbooksController } from "./cashbooks.controller";
import { RetailCashbooksRepository } from "./cashbooks.repository";
import { RetailCashbooksRouter } from "./cashbooks.route";
import { RetailCashbooksService } from "./cashbooks.service";
import { RETAIL_CASHBOOKS_TYPES } from "./cashbooks.types";

export const cashbooksModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCashbooksRepository>(RETAIL_CASHBOOKS_TYPES.Repository).to(RetailCashbooksRepository);
  options.bind<RetailCashbooksService>(RETAIL_CASHBOOKS_TYPES.Service).to(RetailCashbooksService);
  options.bind<RetailCashbooksController>(RETAIL_CASHBOOKS_TYPES.Controller).to(RetailCashbooksController);
  options.bind<RetailCashbooksRouter>(RETAIL_CASHBOOKS_TYPES.Router).to(RetailCashbooksRouter);
});
