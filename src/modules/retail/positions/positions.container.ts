import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPositionsController } from "./positions.controller";
import { RetailPositionsRepository } from "./positions.repository";
import { RetailPositionsRouter } from "./positions.route";
import { RetailPositionsService } from "./positions.service";
import { RETAIL_POSITIONS_TYPES } from "./positions.types";

export const positionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPositionsRepository>(RETAIL_POSITIONS_TYPES.Repository).to(RetailPositionsRepository);
  options.bind<RetailPositionsService>(RETAIL_POSITIONS_TYPES.Service).to(RetailPositionsService);
  options.bind<RetailPositionsController>(RETAIL_POSITIONS_TYPES.Controller).to(RetailPositionsController);
  options.bind<RetailPositionsRouter>(RETAIL_POSITIONS_TYPES.Router).to(RetailPositionsRouter);
});
