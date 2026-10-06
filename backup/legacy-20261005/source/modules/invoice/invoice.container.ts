
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {InvoiceController} from "./invoice.controller";
    import {InvoiceService} from "./invoice.service";
    import {InvoiceRepository} from "./invoice.repository";
    import {InvoiceRouter} from "./invoice.route";
    import {INVOICE_TYPES } from "./invoice.types";



    const invoiceModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<InvoiceService>(INVOICE_TYPES.InvoiceService).to(InvoiceService);
      options.bind<InvoiceController>(INVOICE_TYPES.InvoiceController).to(InvoiceController);
      options.bind<InvoiceRepository>(INVOICE_TYPES.InvoiceRepository).to(InvoiceRepository);
      options.bind<InvoiceRouter>(INVOICE_TYPES.InvoiceRouter).to(InvoiceRouter);
    });

    export { invoiceModule };