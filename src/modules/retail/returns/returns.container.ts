import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailReturnsController } from "./returns.controller";
import { RetailReturnsRepository } from "./returns.repository";
import { RetailReturnsRouter } from "./returns.route";
import { RetailReturnsService } from "./returns.service";
import { RETAIL_RETURNS_TYPES } from "./returns.types";

export const returnsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailReturnsRepository>(RETAIL_RETURNS_TYPES.Repository).to(RetailReturnsRepository);
  options.bind<RetailReturnsService>(RETAIL_RETURNS_TYPES.Service).to(RetailReturnsService);
  options.bind<RetailReturnsController>(RETAIL_RETURNS_TYPES.Controller).to(RetailReturnsController);
  options.bind<RetailReturnsRouter>(RETAIL_RETURNS_TYPES.Router).to(RetailReturnsRouter);
});
