import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCustomerDebts } from "@/database/models/retail/RetailGenericEntities";
import { RetailCustomerDebtsRepository } from "./customerDebts.repository";
import { RETAIL_CUSTOMER_DEBTS_TYPES } from "./customerDebts.types";

@injectable()
export class RetailCustomerDebtsService extends BaseService<RetailCustomerDebts> {
  constructor(@inject(RETAIL_CUSTOMER_DEBTS_TYPES.Repository) repository: RetailCustomerDebtsRepository) {
    super(repository);
  }
}
