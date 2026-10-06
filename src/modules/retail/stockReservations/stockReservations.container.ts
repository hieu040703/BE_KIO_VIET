import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailStockReservationsController } from "./stockReservations.controller";
import { RetailStockReservationsRepository } from "./stockReservations.repository";
import { RetailStockReservationsRouter } from "./stockReservations.route";
import { RetailStockReservationsService } from "./stockReservations.service";
import { RETAIL_STOCK_RESERVATIONS_TYPES } from "./stockReservations.types";

export const stockReservationsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailStockReservationsRepository>(RETAIL_STOCK_RESERVATIONS_TYPES.Repository).to(RetailStockReservationsRepository);
  options.bind<RetailStockReservationsService>(RETAIL_STOCK_RESERVATIONS_TYPES.Service).to(RetailStockReservationsService);
  options.bind<RetailStockReservationsController>(RETAIL_STOCK_RESERVATIONS_TYPES.Controller).to(RetailStockReservationsController);
  options.bind<RetailStockReservationsRouter>(RETAIL_STOCK_RESERVATIONS_TYPES.Router).to(RetailStockReservationsRouter);
});
