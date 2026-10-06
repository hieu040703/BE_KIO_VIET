import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { DebtService } from "./debt.service";
import { DebtRouter } from "./debt.route";
import { DEBT_TYPES } from "./debt.types";
import { DebtRepository } from "./debt.repository";
import { DebtController } from "./debt.controller";
import { ClientDebtRouter } from "./client.debt.route";

const debtModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<DebtService>(DEBT_TYPES.DebtService).to(DebtService);
  options.bind<DebtController>(DEBT_TYPES.DebtController).to(DebtController);
  options.bind<DebtRepository>(DEBT_TYPES.DebtRepository).to(DebtRepository);
  options.bind<DebtRouter>(DEBT_TYPES.DebtRouter).to(DebtRouter);
  options.bind<ClientDebtRouter>(DEBT_TYPES.ClientDebtRouter).to(ClientDebtRouter);
});

export { debtModule };
