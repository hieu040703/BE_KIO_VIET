import { injectable, inject } from "inversify";
import { RetailCustomerTagsService } from "./customerTags.service";
import { RETAIL_CUSTOMER_TAGS_TYPES } from "./customerTags.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCustomerTagsController extends BaseController<RetailCustomerTagsService> {
  constructor(@inject(RETAIL_CUSTOMER_TAGS_TYPES.Service) protected service: RetailCustomerTagsService) {
    super(service);
  }
}
