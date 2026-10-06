import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailAccountTransactions } from "@/database/models/retail/RetailGenericEntities";
import { RetailAccountTransactionsRepository } from "./accountTransactions.repository";
import { RETAIL_ACCOUNT_TRANSACTIONS_TYPES } from "./accountTransactions.types";

@injectable()
export class RetailAccountTransactionsService extends BaseService<RetailAccountTransactions> {
  constructor(@inject(RETAIL_ACCOUNT_TRANSACTIONS_TYPES.Repository) repository: RetailAccountTransactionsRepository) {
    super(repository);
  }
}
