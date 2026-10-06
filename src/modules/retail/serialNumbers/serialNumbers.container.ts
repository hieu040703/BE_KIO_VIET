import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailSerialNumbersController } from "./serialNumbers.controller";
import { RetailSerialNumbersRepository } from "./serialNumbers.repository";
import { RetailSerialNumbersRouter } from "./serialNumbers.route";
import { RetailSerialNumbersService } from "./serialNumbers.service";
import { RETAIL_SERIAL_NUMBERS_TYPES } from "./serialNumbers.types";

export const serialNumbersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailSerialNumbersRepository>(RETAIL_SERIAL_NUMBERS_TYPES.Repository).to(RetailSerialNumbersRepository);
  options.bind<RetailSerialNumbersService>(RETAIL_SERIAL_NUMBERS_TYPES.Service).to(RetailSerialNumbersService);
  options.bind<RetailSerialNumbersController>(RETAIL_SERIAL_NUMBERS_TYPES.Controller).to(RetailSerialNumbersController);
  options.bind<RetailSerialNumbersRouter>(RETAIL_SERIAL_NUMBERS_TYPES.Router).to(RetailSerialNumbersRouter);
});
