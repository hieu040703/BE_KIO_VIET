import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailInvoiceItemsController } from "./invoiceItems.controller";
import { RetailInvoiceItemsRepository } from "./invoiceItems.repository";
import { RetailInvoiceItemsRouter } from "./invoiceItems.route";
import { RetailInvoiceItemsService } from "./invoiceItems.service";
import { RETAIL_INVOICE_ITEMS_TYPES } from "./invoiceItems.types";

export const invoiceItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailInvoiceItemsRepository>(RETAIL_INVOICE_ITEMS_TYPES.Repository).to(RetailInvoiceItemsRepository);
  options.bind<RetailInvoiceItemsService>(RETAIL_INVOICE_ITEMS_TYPES.Service).to(RetailInvoiceItemsService);
  options.bind<RetailInvoiceItemsController>(RETAIL_INVOICE_ITEMS_TYPES.Controller).to(RetailInvoiceItemsController);
  options.bind<RetailInvoiceItemsRouter>(RETAIL_INVOICE_ITEMS_TYPES.Router).to(RetailInvoiceItemsRouter);
});
