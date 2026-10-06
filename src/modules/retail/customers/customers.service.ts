import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCustomer } from "@/database/models";
import { RetailCustomersRepository } from "./customers.repository";
import { RETAIL_CUSTOMERS_TYPES } from "./customers.types";

@injectable()
export class RetailCustomersService extends BaseService<RetailCustomer> {
  constructor(@inject(RETAIL_CUSTOMERS_TYPES.Repository) repository: RetailCustomersRepository) {
    super(repository);
  }
}
