import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailExchangesController } from "./exchanges.controller";
import { RetailExchangesRepository } from "./exchanges.repository";
import { RetailExchangesRouter } from "./exchanges.route";
import { RetailExchangesService } from "./exchanges.service";
import { RETAIL_EXCHANGES_TYPES } from "./exchanges.types";

export const exchangesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailExchangesRepository>(RETAIL_EXCHANGES_TYPES.Repository).to(RetailExchangesRepository);
  options.bind<RetailExchangesService>(RETAIL_EXCHANGES_TYPES.Service).to(RetailExchangesService);
  options.bind<RetailExchangesController>(RETAIL_EXCHANGES_TYPES.Controller).to(RetailExchangesController);
  options.bind<RetailExchangesRouter>(RETAIL_EXCHANGES_TYPES.Router).to(RetailExchangesRouter);
});
