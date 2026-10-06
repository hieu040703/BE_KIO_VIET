import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { FundRepository } from "./fund.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { FUND_TYPES } from "./fund.types";
import { COMMON_TYPES } from "../common/common.types";
import { Fund } from "@/database/models/Fund";
import { FundRelations, FundSelectFull } from "./fund.select";
import logger from "@/shared/utils/logger";
import { FinanceTypeEnum } from "@/shared/constants/constance";
import { IBankData, IEntityManager } from "@/shared/types/interfaces";
import { SocketUtils } from "@/shared/utils/socket.utils";
import { CreateFinanceDto } from "../accountant/finance/finance.validator";
import { CreateFundTransactionDto } from "./fundTransaction/fundTransaction.validator";
import { FinanceService } from "../accountant/finance/finance.service";
import { FINANCE_TYPES, FinanceCreationSourceEnum } from "../accountant/finance/finance.types";
import { CommonService } from "../common/common.service";
import { OrderRepository } from "../order/order.repository";
import { ORDER_TYPES } from "../order/order.types";
import { FUND_TRANSACTION_TYPES } from "./fundTransaction/fundTransaction.types";
import { FundTransactionRepository } from "./fundTransaction/fundTransaction.repository";
import { Request } from "express";
import { BadRequestError } from "@/shared/types/errors";
import { DeepPartial } from "typeorm";
import { ErrorsMessages } from "@/shared/constants/errors";
import { CreateFundDto, UpdateFundDto } from "./fund.validator";

@injectable()
export class FundService extends BaseService<Fund> {
  protected relations = FundRelations;
  protected selectedFields = FundSelectFull;
  constructor(
    @inject(FUND_TYPES.FundRepository) private fundRepository: FundRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(COMMON_TYPES.CommonService) private commonService: CommonService,
    @inject(ORDER_TYPES.OrderRepository) private orderRepository: OrderRepository,
    @inject(FINANCE_TYPES.FinanceService) private financeService: FinanceService,
    @inject(FUND_TRANSACTION_TYPES.FundTransactionRepository)
    private fundTransactionRepository: FundTransactionRepository,
  ) {
    super(fundRepository);
  }

  async validateBeforeCreate(data: CreateFundDto, req?: Request, manager?: IEntityManager): Promise<void> {
    const accountExists = await this.fundRepository.fieldExists("accountNumber", data.accountNumber, manager);
    if (accountExists) {
      throw new BadRequestError("Số tài khoản đã được sử dụng", {
        field: "accountNumber",
        code: ErrorsMessages.already_exists,
      });
    }
  }

  async validateBeforeUpdate(id: string, data: UpdateFundDto, req?: Request, manager?: IEntityManager): Promise<void> {
    if (data.accountNumber) {
      const accountExists = await this.fundRepository.fieldExistsExcludingId(
        "accountNumber",
        data.accountNumber,
        id,
        manager,
      );
      if (accountExists) {
        throw new BadRequestError("Số tài khoản đã được sử dụng", {
          field: "accountNumber",
          code: ErrorsMessages.already_exists,
        });
      }
    }
  }

  async actionAfterCreate(data: Fund, req?: Request, manager?: IEntityManager): Promise<void> {
    if (data.isDefault) {
      await this.fundRepository.unsetDefaultForOtherFunds(data.id, manager);
    }
  }

  async actionAfterUpdate(data: Fund, req?: Request, manager?: IEntityManager): Promise<void> {
    if (data.isDefault) {
      await this.fundRepository.unsetDefaultForOtherFunds(data.id, manager);
    }
  }

  /**
   * nhận thông tin từ webhook của sepay và cập nhật trạng thái nạp tiền
   */
  async handleSepayWebhook(data: IBankData, req?: Request, manager?: IEntityManager): Promise<void> {
    console.log("Data from sepay", data);

    const bankDataDemo = {
      gateway: "MBBank",
      transactionDate: "2026-01-17 13:20:00",
      accountNumber: "0888382699",
      subAccount: null,
      code: "NT0888382699",
      content:
        "MBVCB.12625223638.943148.NT0888382699.CT tu 0721000635974 PHAM VAN NAM toi 0888382699 PHAM VAN NAM tai MB- Ma GD ACSP/ ih943148",
      transferType: "in",
      description:
        "BankAPINotify MBVCB.12625223638.943148.NT0888382699.CT tu 0721000635974 PHAM VAN NAM toi 0888382699 PHAM VAN NAM tai MB- Ma GD ACSP/ ih943148",
      transferAmount: 10000,
      referenceCode: "FT26017021720692",
      accumulated: 5000,
      id: 39139481,
    };

    //? tìm kiếm khoản nạp tiền theo mã giao dịch
    if (data.code) {
      const fund = await this.fundRepository.findFundByAccountNumber(data.accountNumber, manager);

      //? tìm đon hàng theo mã hợp đồng vói nội dung giao dịch
      const order = await this.orderRepository.findOrderByCode(data.code, manager);

      if (!order) {
        logger.warn("⚠️ Không tìm thấy hợp đồng với mã:", data.code);
        return;
      }

      //? nếu tìm thấy, cập nhật trạng thái nạp tiền
      if (fund) {
        const code = await this.commonService.getCode("FundTransaction", manager);
        const dataCreateTransaction: CreateFundTransactionDto = {
          code: code.data.code,
          fundId: fund.id,
          amount: data.transferAmount,
          timeAt: new Date(data.transactionDate),
          transactionCode: data.code,
        };

        const result = await this.fundTransactionRepository.create(dataCreateTransaction, manager);
        logger.info("✅ Đã xử lý webhook nạp tiền từ Sepay", data);

        //? sent socket to user
        SocketUtils.sendSocketToUser("transaction:new", "1", result);

        //? tạo phiếu thu
        const dataCreateFinance: CreateFinanceDto = {
          branchId: order.branchId,
          customerId: order.customerId,
          orderPayments: [
            {
              orderId: order.id,
              amount: data.transferAmount,
            },
          ],
          type: FinanceTypeEnum.INCOME,
          category: "Thu tiền hợp đồng",
          amount: data.transferAmount,
          timeAt: new Date(data.transactionDate),
          isDeposit: false,
        };

        await this.financeService.create(dataCreateFinance, undefined, manager, FinanceCreationSourceEnum.BANK_WEBHOOK);
      } else {
        //? gửi thông báo đến admin , có 1 giao dịch nạp tiền không tìm thấy thông tin tài xế hoặc quỹ , vui lòng check thủ công
        logger.warn("⚠️ Không tìm thấy khoản nạp tiền với mã giao dịch:", data.code);
        throw new BadRequestError("Khoản nạp tiền không hợp lệ");
      }
    } else {
      //? gửi thông báo đến admin , có 1 giao dịch nạp tiền không tìm thấy mã giao dịch , vui lòng check thủ công
      logger.warn("⚠️ Không tìm thấy mã giao dịch trong dữ liệu webhook:", data);
      throw new BadRequestError("Mã giao dịch không hợp lệ");
    }
  }
}
