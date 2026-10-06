import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailVariantAttributeValuesController } from "./variantAttributeValues.controller";
import { RetailVariantAttributeValuesRepository } from "./variantAttributeValues.repository";
import { RetailVariantAttributeValuesRouter } from "./variantAttributeValues.route";
import { RetailVariantAttributeValuesService } from "./variantAttributeValues.service";
import { RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES } from "./variantAttributeValues.types";

export const variantAttributeValuesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailVariantAttributeValuesRepository>(RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES.Repository).to(RetailVariantAttributeValuesRepository);
  options.bind<RetailVariantAttributeValuesService>(RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES.Service).to(RetailVariantAttributeValuesService);
  options.bind<RetailVariantAttributeValuesController>(RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES.Controller).to(RetailVariantAttributeValuesController);
  options.bind<RetailVariantAttributeValuesRouter>(RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES.Router).to(RetailVariantAttributeValuesRouter);
});
