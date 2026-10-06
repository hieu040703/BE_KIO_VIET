import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailInvoicesController } from "./invoices.controller";
import { RetailInvoicesRepository } from "./invoices.repository";
import { RetailInvoicesRouter } from "./invoices.route";
import { RetailInvoicesService } from "./invoices.service";
import { RETAIL_INVOICES_TYPES } from "./invoices.types";

export const invoicesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailInvoicesRepository>(RETAIL_INVOICES_TYPES.Repository).to(RetailInvoicesRepository);
  options.bind<RetailInvoicesService>(RETAIL_INVOICES_TYPES.Service).to(RetailInvoicesService);
  options.bind<RetailInvoicesController>(RETAIL_INVOICES_TYPES.Controller).to(RetailInvoicesController);
  options.bind<RetailInvoicesRouter>(RETAIL_INVOICES_TYPES.Router).to(RetailInvoicesRouter);
});
