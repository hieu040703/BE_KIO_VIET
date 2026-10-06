import { injectable, inject } from "inversify";
import { RetailAttributesService } from "./attributes.service";
import { RETAIL_ATTRIBUTES_TYPES } from "./attributes.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailAttributesController extends BaseController<RetailAttributesService> {
  constructor(@inject(RETAIL_ATTRIBUTES_TYPES.Service) protected service: RetailAttributesService) {
    super(service);
  }
}
