import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AdminVouchersController } from "./admin.vouchers.controller";
import { AdminVouchersRouter } from "./admin.vouchers.route";
import { AdminVouchersService } from "./admin.vouchers.service";
import { ClientVouchersController } from "./client.vouchers.controller";
import { ClientVouchersRouter } from "./client.vouchers.route";
import { ClientVouchersService } from "./client.vouchers.service";
import { VouchersRepository } from "./vouchers.repository";
import { VOUCHERS_TYPES } from "./vouchers.types";

const vouchersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<VouchersRepository>(VOUCHERS_TYPES.VouchersRepository).to(VouchersRepository);
  options.bind<AdminVouchersService>(VOUCHERS_TYPES.AdminVouchersService).to(AdminVouchersService);
  options.bind<AdminVouchersController>(VOUCHERS_TYPES.AdminVouchersController).to(AdminVouchersController);
  options.bind<AdminVouchersRouter>(VOUCHERS_TYPES.AdminVouchersRouter).to(AdminVouchersRouter);
  options.bind<ClientVouchersService>(VOUCHERS_TYPES.ClientVouchersService).to(ClientVouchersService);
  options.bind<ClientVouchersController>(VOUCHERS_TYPES.ClientVouchersController).to(ClientVouchersController);
  options.bind<ClientVouchersRouter>(VOUCHERS_TYPES.ClientVouchersRouter).to(ClientVouchersRouter);
});

export { vouchersModule };
