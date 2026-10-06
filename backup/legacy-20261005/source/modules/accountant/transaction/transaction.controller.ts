import { injectable, inject } from "inversify";
    import { TransactionService } from "./transaction.service";
    import { TRANSACTION_TYPES } from "./transaction.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class TransactionController extends BaseController<TransactionService> {
      constructor(@inject(TRANSACTION_TYPES.TransactionService) protected service: TransactionService) {
        super(service);
      }
    }
    