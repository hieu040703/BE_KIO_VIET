import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPayment } from "@/database/models";
import { RetailPaymentsRepository } from "./payments.repository";
import { RETAIL_PAYMENTS_TYPES } from "./payments.types";

@injectable()
export class RetailPaymentsService extends BaseService<RetailPayment> {
  constructor(@inject(RETAIL_PAYMENTS_TYPES.Repository) repository: RetailPaymentsRepository) {
    super(repository);
  }
}
