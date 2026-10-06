import { injectable, inject } from "inversify";
import { RetailAttributeValuesService } from "./attributeValues.service";
import { RETAIL_ATTRIBUTE_VALUES_TYPES } from "./attributeValues.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailAttributeValuesController extends BaseController<RetailAttributeValuesService> {
  constructor(@inject(RETAIL_ATTRIBUTE_VALUES_TYPES.Service) protected service: RetailAttributeValuesService) {
    super(service);
  }
}
