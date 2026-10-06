import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailVoucherTransactionsController } from "./voucherTransactions.controller";
import { RetailVoucherTransactionsRepository } from "./voucherTransactions.repository";
import { RetailVoucherTransactionsRouter } from "./voucherTransactions.route";
import { RetailVoucherTransactionsService } from "./voucherTransactions.service";
import { RETAIL_VOUCHER_TRANSACTIONS_TYPES } from "./voucherTransactions.types";

export const voucherTransactionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailVoucherTransactionsRepository>(RETAIL_VOUCHER_TRANSACTIONS_TYPES.Repository).to(RetailVoucherTransactionsRepository);
  options.bind<RetailVoucherTransactionsService>(RETAIL_VOUCHER_TRANSACTIONS_TYPES.Service).to(RetailVoucherTransactionsService);
  options.bind<RetailVoucherTransactionsController>(RETAIL_VOUCHER_TRANSACTIONS_TYPES.Controller).to(RetailVoucherTransactionsController);
  options.bind<RetailVoucherTransactionsRouter>(RETAIL_VOUCHER_TRANSACTIONS_TYPES.Router).to(RetailVoucherTransactionsRouter);
});
