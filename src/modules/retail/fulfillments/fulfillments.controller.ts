import { injectable, inject } from "inversify";
import { RetailFulfillmentsService } from "./fulfillments.service";
import { RETAIL_FULFILLMENTS_TYPES } from "./fulfillments.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailFulfillmentsController extends BaseController<RetailFulfillmentsService> {
  constructor(@inject(RETAIL_FULFILLMENTS_TYPES.Service) protected service: RetailFulfillmentsService) {
    super(service);
  }
}
