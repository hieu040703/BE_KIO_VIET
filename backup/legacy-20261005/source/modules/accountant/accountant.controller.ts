import { injectable, inject } from "inversify";
import { BaseController } from "@/shared/base/BaseController";
import { Request, Response } from "express";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { AccountantService } from "./accountant.service";
import { FINANCE_TYPES } from "./finance/finance.types";
import { ACCOUNTANT_TYPES } from "./accountant.types";

@injectable()
export class AccountantController extends BaseController<AccountantService> {
  constructor(
    @inject(ACCOUNTANT_TYPES.AccountantService) protected service: AccountantService,
    @inject(COMMON_TYPES.TransactionManager) protected transactionManager: TransactionManager,
  ) {
    super(service);
  }
}
