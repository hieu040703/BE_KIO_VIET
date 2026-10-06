import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailAttributesController } from "./attributes.controller";
import { RetailAttributesRepository } from "./attributes.repository";
import { RetailAttributesRouter } from "./attributes.route";
import { RetailAttributesService } from "./attributes.service";
import { RETAIL_ATTRIBUTES_TYPES } from "./attributes.types";

export const attributesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailAttributesRepository>(RETAIL_ATTRIBUTES_TYPES.Repository).to(RetailAttributesRepository);
  options.bind<RetailAttributesService>(RETAIL_ATTRIBUTES_TYPES.Service).to(RetailAttributesService);
  options.bind<RetailAttributesController>(RETAIL_ATTRIBUTES_TYPES.Controller).to(RetailAttributesController);
  options.bind<RetailAttributesRouter>(RETAIL_ATTRIBUTES_TYPES.Router).to(RetailAttributesRouter);
});
