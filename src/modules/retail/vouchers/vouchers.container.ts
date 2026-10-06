import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailVouchersController } from "./vouchers.controller";
import { RetailVouchersRepository } from "./vouchers.repository";
import { RetailVouchersRouter } from "./vouchers.route";
import { RetailVouchersService } from "./vouchers.service";
import { RETAIL_VOUCHERS_TYPES } from "./vouchers.types";

export const vouchersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailVouchersRepository>(RETAIL_VOUCHERS_TYPES.Repository).to(RetailVouchersRepository);
  options.bind<RetailVouchersService>(RETAIL_VOUCHERS_TYPES.Service).to(RetailVouchersService);
  options.bind<RetailVouchersController>(RETAIL_VOUCHERS_TYPES.Controller).to(RetailVouchersController);
  options.bind<RetailVouchersRouter>(RETAIL_VOUCHERS_TYPES.Router).to(RetailVouchersRouter);
});
