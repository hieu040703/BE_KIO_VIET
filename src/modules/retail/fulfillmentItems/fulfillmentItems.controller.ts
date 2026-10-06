import { injectable, inject } from "inversify";
import { RetailFulfillmentItemsService } from "./fulfillmentItems.service";
import { RETAIL_FULFILLMENT_ITEMS_TYPES } from "./fulfillmentItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailFulfillmentItemsController extends BaseController<RetailFulfillmentItemsService> {
  constructor(@inject(RETAIL_FULFILLMENT_ITEMS_TYPES.Service) protected service: RetailFulfillmentItemsService) {
    super(service);
  }
}
