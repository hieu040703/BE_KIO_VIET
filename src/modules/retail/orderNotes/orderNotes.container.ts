import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailOrderNotesController } from "./orderNotes.controller";
import { RetailOrderNotesRepository } from "./orderNotes.repository";
import { RetailOrderNotesRouter } from "./orderNotes.route";
import { RetailOrderNotesService } from "./orderNotes.service";
import { RETAIL_ORDER_NOTES_TYPES } from "./orderNotes.types";

export const orderNotesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailOrderNotesRepository>(RETAIL_ORDER_NOTES_TYPES.Repository).to(RetailOrderNotesRepository);
  options.bind<RetailOrderNotesService>(RETAIL_ORDER_NOTES_TYPES.Service).to(RetailOrderNotesService);
  options.bind<RetailOrderNotesController>(RETAIL_ORDER_NOTES_TYPES.Controller).to(RetailOrderNotesController);
  options.bind<RetailOrderNotesRouter>(RETAIL_ORDER_NOTES_TYPES.Router).to(RetailOrderNotesRouter);
});
