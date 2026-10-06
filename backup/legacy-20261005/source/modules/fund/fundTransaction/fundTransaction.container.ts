
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {FundTransactionController} from "./fundTransaction.controller";
    import {FundTransactionService} from "./fundTransaction.service";
    import {FundTransactionRepository} from "./fundTransaction.repository";
    import {FundTransactionRouter} from "./fundTransaction.route";
    import {FUND_TRANSACTION_TYPES } from "./fundTransaction.types";



    const fundTransactionModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<FundTransactionService>(FUND_TRANSACTION_TYPES.FundTransactionService).to(FundTransactionService);
      options.bind<FundTransactionController>(FUND_TRANSACTION_TYPES.FundTransactionController).to(FundTransactionController);
      options.bind<FundTransactionRepository>(FUND_TRANSACTION_TYPES.FundTransactionRepository).to(FundTransactionRepository);
      options.bind<FundTransactionRouter>(FUND_TRANSACTION_TYPES.FundTransactionRouter).to(FundTransactionRouter);
    });

    export { fundTransactionModule };