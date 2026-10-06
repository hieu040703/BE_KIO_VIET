import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailNumberSequencesController } from "./numberSequences.controller";
import { RetailNumberSequencesRepository } from "./numberSequences.repository";
import { RetailNumberSequencesRouter } from "./numberSequences.route";
import { RetailNumberSequencesService } from "./numberSequences.service";
import { RETAIL_NUMBER_SEQUENCES_TYPES } from "./numberSequences.types";

export const numberSequencesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailNumberSequencesRepository>(RETAIL_NUMBER_SEQUENCES_TYPES.Repository).to(RetailNumberSequencesRepository);
  options.bind<RetailNumberSequencesService>(RETAIL_NUMBER_SEQUENCES_TYPES.Service).to(RetailNumberSequencesService);
  options.bind<RetailNumberSequencesController>(RETAIL_NUMBER_SEQUENCES_TYPES.Controller).to(RetailNumberSequencesController);
  options.bind<RetailNumberSequencesRouter>(RETAIL_NUMBER_SEQUENCES_TYPES.Router).to(RetailNumberSequencesRouter);
});
