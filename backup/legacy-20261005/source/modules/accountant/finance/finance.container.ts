
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {FinanceController} from "./finance.controller";
    import {FinanceService} from "./finance.service";
    import {FinanceRepository} from "./finance.repository";
    import {FinanceRouter} from "./finance.route";
    import {FINANCE_TYPES } from "./finance.types";



    const financeModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<FinanceService>(FINANCE_TYPES.FinanceService).to(FinanceService);
      options.bind<FinanceController>(FINANCE_TYPES.FinanceController).to(FinanceController);
      options.bind<FinanceRepository>(FINANCE_TYPES.FinanceRepository).to(FinanceRepository);
      options.bind<FinanceRouter>(FINANCE_TYPES.FinanceRouter).to(FinanceRouter);
    });

    export { financeModule };