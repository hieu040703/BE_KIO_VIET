import { injectable, inject } from "inversify";
import { RetailCashbooksService } from "./cashbooks.service";
import { RETAIL_CASHBOOKS_TYPES } from "./cashbooks.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCashbooksController extends BaseController<RetailCashbooksService> {
  constructor(@inject(RETAIL_CASHBOOKS_TYPES.Service) protected service: RetailCashbooksService) {
    super(service);
  }
}
