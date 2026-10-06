import { injectable, inject } from "inversify";
import { RetailRefundsService } from "./refunds.service";
import { RETAIL_REFUNDS_TYPES } from "./refunds.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailRefundsController extends BaseController<RetailRefundsService> {
  constructor(@inject(RETAIL_REFUNDS_TYPES.Service) protected service: RetailRefundsService) {
    super(service);
  }
}
