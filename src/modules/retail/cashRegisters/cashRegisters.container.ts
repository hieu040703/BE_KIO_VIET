import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCashRegistersController } from "./cashRegisters.controller";
import { RetailCashRegistersRepository } from "./cashRegisters.repository";
import { RetailCashRegistersRouter } from "./cashRegisters.route";
import { RetailCashRegistersService } from "./cashRegisters.service";
import { RETAIL_CASH_REGISTERS_TYPES } from "./cashRegisters.types";

export const cashRegistersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCashRegistersRepository>(RETAIL_CASH_REGISTERS_TYPES.Repository).to(RetailCashRegistersRepository);
  options.bind<RetailCashRegistersService>(RETAIL_CASH_REGISTERS_TYPES.Service).to(RetailCashRegistersService);
  options.bind<RetailCashRegistersController>(RETAIL_CASH_REGISTERS_TYPES.Controller).to(RetailCashRegistersController);
  options.bind<RetailCashRegistersRouter>(RETAIL_CASH_REGISTERS_TYPES.Router).to(RetailCashRegistersRouter);
});
