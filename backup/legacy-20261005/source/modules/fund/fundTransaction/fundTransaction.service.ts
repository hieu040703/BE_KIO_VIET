import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { FundTransactionRepository } from "./fundTransaction.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { FUND_TRANSACTION_TYPES } from "./fundTransaction.types";
import { FundTransaction } from "@/database/models/FundTransaction";
import { FundTransactionRelations, FundTransactionSelectFull } from "./fundTransaction.select";
import { SocketUtils } from "@/shared/utils/socket.utils";
import { CreateFundTransactionDto } from "./fundTransaction.validator";
import { IBankData, IEntityManager } from "@/shared/types/interfaces";
import logger from "@/shared/utils/logger";
import { CommonService } from "@/modules/common/common.service";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { FundRepository } from "../fund.repository";
import { FUND_TYPES } from "../fund.types";
import { ORDER_TYPES } from "@/modules/order/order.types";
import { OrderRepository } from "@/modules/order/order.repository";
import { OrderService } from "@/modules/order/order.service";
import { CreateFinanceDto } from "@/modules/accountant/finance/finance.validator";
import { FinanceTypeEnum } from "@/shared/constants/constance";
import { Request } from "express";
import { FINANCE_TYPES } from "@/modules/accountant/finance/finance.types";
import { FinanceService } from "@/modules/accountant/finance/finance.service";

@injectable()
export class FundTransactionService extends BaseService<FundTransaction> {
  protected relations = FundTransactionRelations;
  protected selectedFields = FundTransactionSelectFull;
  constructor(
    @inject(FUND_TRANSACTION_TYPES.FundTransactionRepository)
    private fundTransactionRepository: FundTransactionRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(fundTransactionRepository);
  }
}
