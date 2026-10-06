import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCustomerNotesController } from "./customerNotes.controller";
import { RetailCustomerNotesRepository } from "./customerNotes.repository";
import { RetailCustomerNotesRouter } from "./customerNotes.route";
import { RetailCustomerNotesService } from "./customerNotes.service";
import { RETAIL_CUSTOMER_NOTES_TYPES } from "./customerNotes.types";

export const customerNotesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCustomerNotesRepository>(RETAIL_CUSTOMER_NOTES_TYPES.Repository).to(RetailCustomerNotesRepository);
  options.bind<RetailCustomerNotesService>(RETAIL_CUSTOMER_NOTES_TYPES.Service).to(RetailCustomerNotesService);
  options.bind<RetailCustomerNotesController>(RETAIL_CUSTOMER_NOTES_TYPES.Controller).to(RetailCustomerNotesController);
  options.bind<RetailCustomerNotesRouter>(RETAIL_CUSTOMER_NOTES_TYPES.Router).to(RetailCustomerNotesRouter);
});
