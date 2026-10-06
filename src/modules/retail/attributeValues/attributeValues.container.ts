import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailAttributeValuesController } from "./attributeValues.controller";
import { RetailAttributeValuesRepository } from "./attributeValues.repository";
import { RetailAttributeValuesRouter } from "./attributeValues.route";
import { RetailAttributeValuesService } from "./attributeValues.service";
import { RETAIL_ATTRIBUTE_VALUES_TYPES } from "./attributeValues.types";

export const attributeValuesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailAttributeValuesRepository>(RETAIL_ATTRIBUTE_VALUES_TYPES.Repository).to(RetailAttributeValuesRepository);
  options.bind<RetailAttributeValuesService>(RETAIL_ATTRIBUTE_VALUES_TYPES.Service).to(RetailAttributeValuesService);
  options.bind<RetailAttributeValuesController>(RETAIL_ATTRIBUTE_VALUES_TYPES.Controller).to(RetailAttributeValuesController);
  options.bind<RetailAttributeValuesRouter>(RETAIL_ATTRIBUTE_VALUES_TYPES.Router).to(RetailAttributeValuesRouter);
});
