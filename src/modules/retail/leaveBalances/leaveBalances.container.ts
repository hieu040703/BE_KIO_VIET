import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailLeaveBalancesController } from "./leaveBalances.controller";
import { RetailLeaveBalancesRepository } from "./leaveBalances.repository";
import { RetailLeaveBalancesRouter } from "./leaveBalances.route";
import { RetailLeaveBalancesService } from "./leaveBalances.service";
import { RETAIL_LEAVE_BALANCES_TYPES } from "./leaveBalances.types";

export const leaveBalancesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailLeaveBalancesRepository>(RETAIL_LEAVE_BALANCES_TYPES.Repository).to(RetailLeaveBalancesRepository);
  options.bind<RetailLeaveBalancesService>(RETAIL_LEAVE_BALANCES_TYPES.Service).to(RetailLeaveBalancesService);
  options.bind<RetailLeaveBalancesController>(RETAIL_LEAVE_BALANCES_TYPES.Controller).to(RetailLeaveBalancesController);
  options.bind<RetailLeaveBalancesRouter>(RETAIL_LEAVE_BALANCES_TYPES.Router).to(RetailLeaveBalancesRouter);
});
