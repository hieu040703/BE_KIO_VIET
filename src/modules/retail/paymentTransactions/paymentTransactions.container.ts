import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPaymentTransactionsController } from "./paymentTransactions.controller";
import { RetailPaymentTransactionsRepository } from "./paymentTransactions.repository";
import { RetailPaymentTransactionsRouter } from "./paymentTransactions.route";
import { RetailPaymentTransactionsService } from "./paymentTransactions.service";
import { RETAIL_PAYMENT_TRANSACTIONS_TYPES } from "./paymentTransactions.types";

export const paymentTransactionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPaymentTransactionsRepository>(RETAIL_PAYMENT_TRANSACTIONS_TYPES.Repository).to(RetailPaymentTransactionsRepository);
  options.bind<RetailPaymentTransactionsService>(RETAIL_PAYMENT_TRANSACTIONS_TYPES.Service).to(RetailPaymentTransactionsService);
  options.bind<RetailPaymentTransactionsController>(RETAIL_PAYMENT_TRANSACTIONS_TYPES.Controller).to(RetailPaymentTransactionsController);
  options.bind<RetailPaymentTransactionsRouter>(RETAIL_PAYMENT_TRANSACTIONS_TYPES.Router).to(RetailPaymentTransactionsRouter);
});
