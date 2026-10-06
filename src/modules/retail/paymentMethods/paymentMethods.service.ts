import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPaymentMethods } from "@/database/models/retail/RetailGenericEntities";
import { RetailPaymentMethodsRepository } from "./paymentMethods.repository";
import { RETAIL_PAYMENT_METHODS_TYPES } from "./paymentMethods.types";

@injectable()
export class RetailPaymentMethodsService extends BaseService<RetailPaymentMethods> {
  constructor(@inject(RETAIL_PAYMENT_METHODS_TYPES.Repository) repository: RetailPaymentMethodsRepository) {
    super(repository);
  }
}
