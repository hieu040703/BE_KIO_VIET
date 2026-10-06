import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCashMovementsController } from "./cashMovements.controller";
import { RetailCashMovementsRepository } from "./cashMovements.repository";
import { RetailCashMovementsRouter } from "./cashMovements.route";
import { RetailCashMovementsService } from "./cashMovements.service";
import { RETAIL_CASH_MOVEMENTS_TYPES } from "./cashMovements.types";

export const cashMovementsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCashMovementsRepository>(RETAIL_CASH_MOVEMENTS_TYPES.Repository).to(RetailCashMovementsRepository);
  options.bind<RetailCashMovementsService>(RETAIL_CASH_MOVEMENTS_TYPES.Service).to(RetailCashMovementsService);
  options.bind<RetailCashMovementsController>(RETAIL_CASH_MOVEMENTS_TYPES.Controller).to(RetailCashMovementsController);
  options.bind<RetailCashMovementsRouter>(RETAIL_CASH_MOVEMENTS_TYPES.Router).to(RetailCashMovementsRouter);
});
