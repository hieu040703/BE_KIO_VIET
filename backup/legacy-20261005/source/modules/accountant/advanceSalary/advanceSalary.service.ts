import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { AdvanceSalaryRepository } from "./advanceSalary.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { ADVANCE_SALARY_TYPES } from "./advanceSalary.types";
import { COMMON_TYPES } from "../../common/common.types";
import { AdvanceSalaryRelations, AdvanceSalarySelectFull } from "./advanceSalary.select";
import { ApiResponse, IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { CreateAdvanceSalaryDto } from "./advanceSalary.validator";
import { CommonService } from "../../common/common.service";
import { BadRequestError, ForbiddenError } from "@/shared/types/errors";
import { Finance } from "@/database/models/Finance";
import { TRANSACTION_TYPES } from "../transaction/transaction.types";
import { TransactionService } from "../transaction/transaction.service";
import {
  AttributeTypeEnum,
  ExpenseApprovalStatusEnum,
  FinanceTypeEnum,
  OtherAmountTypeEnum,
} from "@/shared/constants/constance";
import { AttributeService } from "@/modules/attribute/attribute.service";
import { ATTRIBUTE_TYPES } from "@/modules/attribute/attribute.types";
import { TIME_KEEPING_TYPES } from "@/modules/timeKeeping/timeKeeping.types";
import { TimeKeepingRepository } from "@/modules/timeKeeping/timeKeeping.repository";
import { CreateTimeKeepingDto } from "@/modules/timeKeeping/timeKeeping.validator";

@injectable()
export class AdvanceSalaryService extends BaseService<Finance> {
  protected relations = AdvanceSalaryRelations;
  protected selectedFields = AdvanceSalarySelectFull;
  constructor(
    @inject(ADVANCE_SALARY_TYPES.AdvanceSalaryRepository) private advanceSalaryRepository: AdvanceSalaryRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(COMMON_TYPES.CommonService) private commonService: CommonService,
    @inject(TRANSACTION_TYPES.TransactionService) private transactionService: TransactionService,
    @inject(ATTRIBUTE_TYPES.AttributeService) private attributeService: AttributeService,
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository) private timeKeepingRepository: TimeKeepingRepository,
  ) {
    super(advanceSalaryRepository);
  }

  protected async attachMoreDataToSummary(summary: any, options: IFindOptions<Finance>): Promise<any> {
    const deducted = await this.advanceSalaryRepository.sumByOptions("amount", {
      ...options,
      where: {
        ...options.where,
        type: FinanceTypeEnum.ADVANCE_SALARY,
        isDeductedAdvanceSalary: true,
        status: ExpenseApprovalStatusEnum.APPROVED,
      },
    });

    summary.deducted = deducted;

    const nonDeducted = await this.advanceSalaryRepository.sumByOptions("amount", {
      ...options,
      where: {
        ...options.where,
        type: FinanceTypeEnum.ADVANCE_SALARY,
        isDeductedAdvanceSalary: false,
        status: ExpenseApprovalStatusEnum.APPROVED,
      },
    });

    summary.nonDeducted = nonDeducted;

    return summary;
  }

  async validateBeforeCreate(data: CreateAdvanceSalaryDto, req: Request, manager?: IEntityManager): Promise<void> {
    // Add your validation logic here
    if (!data.code) {
      const code = await this.commonService.getCode("AdvanceSalary", manager);
      data.code = code.data.code;
    } else {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.advanceSalaryRepository.fieldExists("code", data.code, manager);
      if (codeExists) {
        throw new BadRequestError("Mã giao dịch đã tồn tại");
      }
    }

    const userId = req.user?.userId;

    if (!userId) {
      throw new ForbiddenError("Tài nguyên không hợp lệ");
    }

    data.userId = userId;

    data.status = ExpenseApprovalStatusEnum.PENDING;
  }

  async actionAfterCreate(data: Finance, req?: Request, manager?: IEntityManager): Promise<void> {
    const attributeExist = await this.attributeService.checkExistNameAndType(
      data.category,
      AttributeTypeEnum.ADVANCE_SALARY,
      manager,
    );
    if (!attributeExist) {
      await this.attributeService.create({ name: data.category, type: AttributeTypeEnum.ADVANCE_SALARY }, req, manager);
    }
  }

  async validateBeforeUpdate(
    id: string,
    data: Partial<Finance>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const existingFinance = await this.advanceSalaryRepository.findById(id, manager);
    if (!existingFinance) {
      throw new BadRequestError("Giao dịch không tồn tại");
    }

    if (existingFinance.isDeductedAdvanceSalary) {
      throw new BadRequestError("Không thể chỉnh sửa khoản tạm ứng lương đã được khấu trừ");
    }

    if (data.code && data.code !== existingFinance.code) {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.advanceSalaryRepository.fieldExists("code", data.code, manager);
      if (codeExists) {
        throw new BadRequestError("Mã giao dịch đã tồn tại");
      }
    }

    if (data.amount && data.amount !== existingFinance.amount) {
      // nếu phiếu đang trong trạng thái chờ duyệt hoặc đã duyệt thì không cho sửa số tiền
      if (existingFinance.status === ExpenseApprovalStatusEnum.APPROVED) {
        throw new BadRequestError("Không thể sửa số tiền của phiếu đã được duyệt");
      }
    }
  }

  async actionAfterUpdate(data: Finance, req?: Request, manager?: IEntityManager): Promise<void> {
    await this.transactionService.updateTransactionFromAdvanceSalary(data, manager);

    const attributeExist = await this.attributeService.checkExistNameAndType(
      data.category,
      AttributeTypeEnum.ADVANCE_SALARY,
      manager,
    );
    if (!attributeExist) {
      await this.attributeService.create({ name: data.category, type: AttributeTypeEnum.ADVANCE_SALARY }, req, manager);
    }

    //? tìm dữ liệu liên quan bên bảng chấm công và cập nhật lại
    const timeKeeping = await this.timeKeepingRepository.findOne(
      {
        advanceSalaryId: data.id,
      },
      manager,
    );

    if (timeKeeping) {
      const dataUpdateTimeKeeping: Partial<CreateTimeKeepingDto> = {
        employeeId: data.employeeId!,
        timeAt: data.timeAt,
        otherAmount: data.amount,
        otherAmountType: OtherAmountTypeEnum.ADVANCE_SALARY,
      };
      await this.timeKeepingRepository.update(timeKeeping.id, dataUpdateTimeKeeping, manager);
    }
  }

  async delete(id: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse<Boolean>> {
    const deleteWithManager = async (transactionManager: IEntityManager) => {
      const existing = await this.advanceSalaryRepository.findById(id, transactionManager);
      if (!existing) {
        return await super.delete(id, req, transactionManager);
      }

      // Xóa bản ghi chấm công trước để giải phóng FK time_keepings.advanceSalaryId.
      const timeKeeping = await this.timeKeepingRepository.findOne(
        {
          advanceSalaryId: id,
        },
        transactionManager,
      );

      if (timeKeeping) {
        await this.timeKeepingRepository.delete(timeKeeping.id, transactionManager);
      }

      return await super.delete(id, req, transactionManager);
    };

    if (manager) {
      return await deleteWithManager(manager);
    }

    return await this.transactionManager.withTransactionCallback(deleteWithManager);
  }

  async actionAfterDelete(data: Finance, req?: Request, manager?: IEntityManager): Promise<void> {
    // Xoá giao dịch liên quan
    await this.transactionService.deleteTransactionFromAdvanceSalary(data, manager);

    //? tìm dữ liệu liên quan bên bảng chấm công và xoá
    const timeKeeping = await this.timeKeepingRepository.findOne(
      {
        advanceSalaryId: data.id,
      },
      manager,
    );

    if (timeKeeping) {
      await this.timeKeepingRepository.delete(timeKeeping.id, manager);
    }
  }
}
