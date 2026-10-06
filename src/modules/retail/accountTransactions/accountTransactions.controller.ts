import { injectable, inject } from "inversify";
import { RetailAccountTransactionsService } from "./accountTransactions.service";
import { RETAIL_ACCOUNT_TRANSACTIONS_TYPES } from "./accountTransactions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailAccountTransactionsController extends BaseController<RetailAccountTransactionsService> {
  constructor(@inject(RETAIL_ACCOUNT_TRANSACTIONS_TYPES.Service) protected service: RetailAccountTransactionsService) {
    super(service);
  }
}
