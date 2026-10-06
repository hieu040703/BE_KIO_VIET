import { injectable, inject } from "inversify";
import { RetailPaymentMethodsService } from "./paymentMethods.service";
import { RETAIL_PAYMENT_METHODS_TYPES } from "./paymentMethods.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPaymentMethodsController extends BaseController<RetailPaymentMethodsService> {
  constructor(@inject(RETAIL_PAYMENT_METHODS_TYPES.Service) protected service: RetailPaymentMethodsService) {
    super(service);
  }
}
