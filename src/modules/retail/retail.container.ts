import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailController } from "./retail.controller";
import { RetailRepository } from "./retail.repository";
import { RetailRouter } from "./retail.route";
import { RetailService } from "./retail.service";
import { RETAIL_TYPES } from "./retail.types";

export const retailModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailRepository>(RETAIL_TYPES.RetailRepository).to(RetailRepository);
  options.bind<RetailService>(RETAIL_TYPES.RetailService).to(RetailService);
  options.bind<RetailController>(RETAIL_TYPES.RetailController).to(RetailController);
  options.bind<RetailRouter>(RETAIL_TYPES.RetailRouter).to(RetailRouter);
});
