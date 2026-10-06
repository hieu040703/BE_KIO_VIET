import { injectable, inject } from "inversify";
import { RetailVariantAttributeValuesService } from "./variantAttributeValues.service";
import { RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES } from "./variantAttributeValues.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailVariantAttributeValuesController extends BaseController<RetailVariantAttributeValuesService> {
  constructor(@inject(RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES.Service) protected service: RetailVariantAttributeValuesService) {
    super(service);
  }
}
