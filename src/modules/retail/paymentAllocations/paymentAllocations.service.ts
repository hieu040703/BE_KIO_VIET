import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPaymentAllocations } from "@/database/models/retail/RetailGenericEntities";
import { RetailPaymentAllocationsRepository } from "./paymentAllocations.repository";
import { RETAIL_PAYMENT_ALLOCATIONS_TYPES } from "./paymentAllocations.types";

@injectable()
export class RetailPaymentAllocationsService extends BaseService<RetailPaymentAllocations> {
  constructor(@inject(RETAIL_PAYMENT_ALLOCATIONS_TYPES.Repository) repository: RetailPaymentAllocationsRepository) {
    super(repository);
  }
}
