import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailSupplierDebtsController } from "./supplierDebts.controller";
import { RetailSupplierDebtsRepository } from "./supplierDebts.repository";
import { RetailSupplierDebtsRouter } from "./supplierDebts.route";
import { RetailSupplierDebtsService } from "./supplierDebts.service";
import { RETAIL_SUPPLIER_DEBTS_TYPES } from "./supplierDebts.types";

export const supplierDebtsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailSupplierDebtsRepository>(RETAIL_SUPPLIER_DEBTS_TYPES.Repository).to(RetailSupplierDebtsRepository);
  options.bind<RetailSupplierDebtsService>(RETAIL_SUPPLIER_DEBTS_TYPES.Service).to(RetailSupplierDebtsService);
  options.bind<RetailSupplierDebtsController>(RETAIL_SUPPLIER_DEBTS_TYPES.Controller).to(RetailSupplierDebtsController);
  options.bind<RetailSupplierDebtsRouter>(RETAIL_SUPPLIER_DEBTS_TYPES.Router).to(RetailSupplierDebtsRouter);
});
