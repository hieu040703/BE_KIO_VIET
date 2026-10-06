import { injectable, inject } from "inversify";
import { RetailPaymentsService } from "./payments.service";
import { RETAIL_PAYMENTS_TYPES } from "./payments.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPaymentsController extends BaseController<RetailPaymentsService> {
  constructor(@inject(RETAIL_PAYMENTS_TYPES.Service) protected service: RetailPaymentsService) {
    super(service);
  }
}
