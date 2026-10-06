import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailBonusesController } from "./bonuses.controller";
import { RetailBonusesRepository } from "./bonuses.repository";
import { RetailBonusesRouter } from "./bonuses.route";
import { RetailBonusesService } from "./bonuses.service";
import { RETAIL_BONUSES_TYPES } from "./bonuses.types";

export const bonusesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailBonusesRepository>(RETAIL_BONUSES_TYPES.Repository).to(RetailBonusesRepository);
  options.bind<RetailBonusesService>(RETAIL_BONUSES_TYPES.Service).to(RetailBonusesService);
  options.bind<RetailBonusesController>(RETAIL_BONUSES_TYPES.Controller).to(RetailBonusesController);
  options.bind<RetailBonusesRouter>(RETAIL_BONUSES_TYPES.Router).to(RetailBonusesRouter);
});
