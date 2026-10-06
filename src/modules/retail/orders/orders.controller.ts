import { injectable, inject } from "inversify";
import { RetailOrdersService } from "./orders.service";
import { RETAIL_ORDERS_TYPES } from "./orders.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailOrdersController extends BaseController<RetailOrdersService> {
  constructor(@inject(RETAIL_ORDERS_TYPES.Service) protected service: RetailOrdersService) {
    super(service);
  }
}
