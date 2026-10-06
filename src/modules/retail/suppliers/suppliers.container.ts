import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailSuppliersController } from "./suppliers.controller";
import { RetailSuppliersRepository } from "./suppliers.repository";
import { RetailSuppliersRouter } from "./suppliers.route";
import { RetailSuppliersService } from "./suppliers.service";
import { RETAIL_SUPPLIERS_TYPES } from "./suppliers.types";

export const suppliersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailSuppliersRepository>(RETAIL_SUPPLIERS_TYPES.Repository).to(RetailSuppliersRepository);
  options.bind<RetailSuppliersService>(RETAIL_SUPPLIERS_TYPES.Service).to(RetailSuppliersService);
  options.bind<RetailSuppliersController>(RETAIL_SUPPLIERS_TYPES.Controller).to(RetailSuppliersController);
  options.bind<RetailSuppliersRouter>(RETAIL_SUPPLIERS_TYPES.Router).to(RetailSuppliersRouter);
});
