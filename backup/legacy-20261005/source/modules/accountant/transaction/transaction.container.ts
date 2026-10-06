
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {TransactionController} from "./transaction.controller";
    import {TransactionService} from "./transaction.service";
    import {TransactionRepository} from "./transaction.repository";
    import {TransactionRouter} from "./transaction.route";
    import {TRANSACTION_TYPES } from "./transaction.types";



    const transactionModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<TransactionService>(TRANSACTION_TYPES.TransactionService).to(TransactionService);
      options.bind<TransactionController>(TRANSACTION_TYPES.TransactionController).to(TransactionController);
      options.bind<TransactionRepository>(TRANSACTION_TYPES.TransactionRepository).to(TransactionRepository);
      options.bind<TransactionRouter>(TRANSACTION_TYPES.TransactionRouter).to(TransactionRouter);
    });

    export { transactionModule };