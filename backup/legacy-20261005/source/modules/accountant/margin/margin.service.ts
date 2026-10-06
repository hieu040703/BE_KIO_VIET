import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { MarginRepository } from "./margin.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { MARGIN_TYPES } from "./margin.types";
import { Margin } from "@/database/models/Margin";
import { MarginRelations, MarginSelectFull } from "./margin.select";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { ApiResponse, IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { TRANSACTION_TYPES } from "../transaction/transaction.types";
import { TransactionService } from "../transaction/transaction.service";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/shared/types/errors";
import { CommonService } from "@/modules/common/common.service";
import { CreateMarginDto } from "./margin.validator";
import { BRANCH_TYPES } from "@/modules/branch/branch.types";
import { BranchRepository } from "@/modules/branch/branch.repository";
import { CreateTimeKeepingDto } from "@/modules/timeKeeping/timeKeeping.validator";
import {
  MarginStatusEnum,
  MarginTypeEnum,
  OtherAmountTypeEnum,
  TimeKeepingTypeEnum,
} from "@/shared/constants/constance";
import { TIME_KEEPING_TYPES } from "@/modules/timeKeeping/timeKeeping.types";
import { TimeKeepingRepository } from "@/modules/timeKeeping/timeKeeping.repository";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { IsNull, Not } from "typeorm";

@injectable()
export class MarginService extends BaseService<Margin> {
  protected relations = MarginRelations;
  protected selectedFields = MarginSelectFull;
  constructor(
    @inject(MARGIN_TYPES.MarginRepository) private marginRepository: MarginRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(TRANSACTION_TYPES.TransactionService) private transactionService: TransactionService,
    @inject(COMMON_TYPES.CommonService) private commonService: CommonService,
    @inject(BRANCH_TYPES.BranchRepository) private branchRepository: BranchRepository,
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository) private timeKeepingRepository: TimeKeepingRepository,
  ) {
    super(marginRepository);
  }

  protected async attachMoreDataToSummary(summary: any, options: IFindOptions<Margin>): Promise<any> {
    const refunded = await this.marginRepository.sumByOptions("amount", {
      ...options,
      where: {
        ...options.where,
        status: MarginStatusEnum.APPROVED,
      },
    });

    summary.refunded = refunded;

    const nonRefunded = await this.marginRepository.sumByOptions("amount", {
      ...options,
      where: {
        ...options.where,
        status: IsNull(),
      },
    });

    summary.nonRefunded = nonRefunded;

    return summary;
  }

  async validateBeforeCreate(data: CreateMarginDto, req?: Request, manager?: IEntityManager): Promise<void> {
    if (data.branchId) {
      const branchExists = await this.branchRepository.findById(data.branchId, manager);
      if (!branchExists) {
        throw new NotFoundError("Chi nhánh không tồn tại");
      }
    }
    // Add your validation logic here
    if (!data.code) {
      const code = await this.commonService.getCode("Margin", manager);
      data.code = code.data.code;
    } else {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.marginRepository.fieldExists("code", data.code, manager);
      if (codeExists) {
        throw new BadRequestError("Mã giao dịch đã tồn tại");
      }
    }

    //? kiểm tra xem nhân viên đã có các khoản ký quỹ tồn tại chưa
    const marginExist = await this.marginRepository.findOne({
      employeeId: data.employeeId,
      type: data.type,
      status: Not(MarginStatusEnum.APPROVED),
    });

    if (marginExist) {
      throw new BadRequestError("Nhân viên đã có khoản ký quỹ tồn tại");
    }

    const userId = req?.user?.userId;

    if (!userId) {
      throw new ForbiddenError("Tài nguyên không hợp lệ");
    }

    data.userId = userId;
  }

  async actionAfterCreate(data: Margin, req?: Request, manager?: IEntityManager): Promise<void> {
    await this.transactionService.createTransactionFromCreateMargin(data, manager);
  }

  async validateBeforeUpdate(
    id: string,
    data: Partial<Margin>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const existingFinance = await this.marginRepository.findById(id, manager);
    if (!existingFinance) {
      throw new BadRequestError("Giao dịch không tồn tại");
    }
    if (data.code && data.code !== existingFinance.code) {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.marginRepository.fieldExists("code", data.code, manager);
      if (codeExists) {
        throw new BadRequestError("Mã giao dịch đã tồn tại");
      }
    }
  }

  async validateBeforeDelete(id: string, req?: Request, manager?: IEntityManager): Promise<void> {
    const existingFinance = await this.marginRepository.findById(id, manager);
    if (!existingFinance) {
      throw new BadRequestError("Giao dịch không tồn tại");
    }
    // nếu khoản ký quỹ đã được duyệt thì không được xóa
    if (existingFinance.status === MarginStatusEnum.APPROVED) {
      throw new BadRequestError("Khoản ký quỹ đã được duyệt, không thể xóa");
    }
  }

  async actionAfterDelete(data: Margin, req?: Request, manager?: IEntityManager): Promise<void> {
    // xóa các bản ghi liên quan bên bảng chấm công nếu có
    const timeKeepings = await this.timeKeepingRepository.findByOptions({
      where: {
        marginId: data.id,
      },
    });

    for (const tk of timeKeepings) {
      await this.timeKeepingRepository.delete(tk.id, manager);
    }

    // xóa giao dịch liên quan
    await this.transactionService.deleteTransactionFromMargin(data, manager);
  }

  //? hoàn trả khoản ký quỹ cho nhân viên
  async refundMargin(
    marginId: string,
    timeAt: Date,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<void>> {
    const margin = await this.marginRepository.findById(marginId, manager);
    if (!margin) {
      throw new NotFoundError("Khoản ký quỹ không tồn tại");
    }
    if (margin.status === MarginStatusEnum.APPROVED) {
      throw new BadRequestError("Khoản ký quỹ đã được hoàn trả");
    }

    await this.marginRepository.update(marginId, { status: MarginStatusEnum.APPROVED }, manager);

    //? tạo 1 khoản phải thu khác bên bảng lương
    const dataCreateTimeKeeping: CreateTimeKeepingDto = {
      type: TimeKeepingTypeEnum.OUT, // khoản này phải trả cho nhân viên khi họ đã nghỉ việc
      employeeId: margin.employeeId!,
      timeAt,
      otherAmount: margin.amount,
      otherAmountType: margin.type === MarginTypeEnum.MARGIN ? OtherAmountTypeEnum.MARGIN : OtherAmountTypeEnum.UNIFORM,
      marginId: margin.id,
      note: `Hoàn trả khoản ${margin.type === MarginTypeEnum.MARGIN ? "ký quỹ" : "đồng phục"} cho nhân viên`,
    };

    await this.timeKeepingRepository.create(dataCreateTimeKeeping, manager);

    return ApiResponseHandler.createSuccess("OK");
  }
}
