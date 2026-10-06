import { injectable, inject } from "inversify";
    import { FundTransactionService } from "./fundTransaction.service";
    import { FUND_TRANSACTION_TYPES } from "./fundTransaction.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class FundTransactionController extends BaseController<FundTransactionService> {
      constructor(@inject(FUND_TRANSACTION_TYPES.FundTransactionService) protected service: FundTransactionService) {
        super(service);
      }
    }
    