import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { DebtRepository } from "./debt.repository";
import { DEBT_TYPES } from "./debt.types";
import { Debt } from "@/database/models/Debt";
import { BadRequestError } from "@/shared/types/errors";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { DebtRelations, DebtSelectFull } from "./debt.select";
import { CreateDebtDto, DebtQueryDto } from "./debt.validator";
import { CommonService } from "@/modules/common/common.service";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { ApiResponse, IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";

@injectable()
export class DebtService extends BaseService<Debt> {
  protected relations = DebtRelations;
  protected selectedFields = DebtSelectFull;
  constructor(
    @inject(DEBT_TYPES.DebtRepository) private debtRepository: DebtRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(COMMON_TYPES.CommonService) private commonService: CommonService,
  ) {
    super(debtRepository);
  }

  protected async attachMoreDataToSummary(summary: any, options: IFindOptions<Debt>): Promise<any> {
    const res = await this.debtRepository.getDebtSummaryByCondition(options);

    if (res) {
      return {
        ...summary,
        totalBeginningDebt: res.totalBeginningDebt,
        totalIncrease: res.totalIncrease,
        totalDecrease: res.totalDecrease,
        totalEndingDebt: res.totalEndingDebt,
      };
    } else {
      return summary;
    }
  }

  async validateBeforeCreate(data: CreateDebtDto, req?: Request, manager?: IEntityManager): Promise<void> {
    // Add your validation logic here
    if (!data.code) {
      const code = await this.commonService.getCode("Debt", manager);
      data.code = code.data.code;
    } else {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.debtRepository.fieldExists("code", data.code, manager);
      if (codeExists) {
        throw new BadRequestError("Mã giao dịch đã tồn tại");
      }
    }
  }

  async getDebtByCustomerId(customerId: string, data: DebtQueryDto, manager?: IEntityManager): Promise<any> {
    const res = await this.debtRepository.getDebtByCustomerId(customerId, data, manager);
    return ApiResponseHandler.getSuccess("OK", res);
  }

  async delete(id: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse<boolean>> {
    const debt = await this.debtRepository.findById(id, manager);
    if (!debt) {
      throw new BadRequestError("Công nợ không tồn tại");
    }
    await this.debtRepository.delete(id, manager);
    return ApiResponseHandler.getSuccess("OK", true);
  }

  async calculateCustomerDebtAtTime(customerId: string, time?: Date, manager?: IEntityManager): Promise<number> {
    const timeCheck = time || new Date();
    console.log("timeCheck", timeCheck);
    const res = await this.debtRepository.calculateCustomerDebtAtTime(customerId, timeCheck, manager);
    return res;
  }
}
