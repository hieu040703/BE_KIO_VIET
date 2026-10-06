import { injectable, inject } from "inversify";
import { RetailCustomersService } from "./customers.service";
import { RETAIL_CUSTOMERS_TYPES } from "./customers.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCustomersController extends BaseController<RetailCustomersService> {
  constructor(@inject(RETAIL_CUSTOMERS_TYPES.Service) protected service: RetailCustomersService) {
    super(service);
  }
}
