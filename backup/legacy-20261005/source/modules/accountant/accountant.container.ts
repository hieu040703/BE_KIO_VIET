import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { ACCOUNTANT_TYPES } from "./accountant.types";
import { AccountantRouter } from "./accountant.route";
import { AccountantService } from "./accountant.service";
import { AccountantController } from "./accountant.controller";

const accountantModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<AccountantRouter>(ACCOUNTANT_TYPES.AccountantRouter).to(AccountantRouter);
  options.bind<AccountantService>(ACCOUNTANT_TYPES.AccountantService).to(AccountantService);
  options.bind<AccountantController>(ACCOUNTANT_TYPES.AccountantController).to(AccountantController);
});

export { accountantModule };
