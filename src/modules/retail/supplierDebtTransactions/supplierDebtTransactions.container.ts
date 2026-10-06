import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailSupplierDebtTransactionsController } from "./supplierDebtTransactions.controller";
import { RetailSupplierDebtTransactionsRepository } from "./supplierDebtTransactions.repository";
import { RetailSupplierDebtTransactionsRouter } from "./supplierDebtTransactions.route";
import { RetailSupplierDebtTransactionsService } from "./supplierDebtTransactions.service";
import { RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES } from "./supplierDebtTransactions.types";

export const supplierDebtTransactionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailSupplierDebtTransactionsRepository>(RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES.Repository).to(RetailSupplierDebtTransactionsRepository);
  options.bind<RetailSupplierDebtTransactionsService>(RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES.Service).to(RetailSupplierDebtTransactionsService);
  options.bind<RetailSupplierDebtTransactionsController>(RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES.Controller).to(RetailSupplierDebtTransactionsController);
  options.bind<RetailSupplierDebtTransactionsRouter>(RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES.Router).to(RetailSupplierDebtTransactionsRouter);
});
