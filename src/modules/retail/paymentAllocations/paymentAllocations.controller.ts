import { injectable, inject } from "inversify";
import { RetailPaymentAllocationsService } from "./paymentAllocations.service";
import { RETAIL_PAYMENT_ALLOCATIONS_TYPES } from "./paymentAllocations.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPaymentAllocationsController extends BaseController<RetailPaymentAllocationsService> {
  constructor(@inject(RETAIL_PAYMENT_ALLOCATIONS_TYPES.Service) protected service: RetailPaymentAllocationsService) {
    super(service);
  }
}
