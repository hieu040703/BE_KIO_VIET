import { Request } from "express";
import { injectable, inject } from "inversify";
import { Finance } from "@/database/models/Finance";
import { BaseService } from "@/shared/base/BaseService";
import { COMMON_TYPES } from "../../common/common.types";
import { CommonService } from "../../common/common.service";
import { ADVANCE_EMPLOYEE_TYPES } from "./advanceEmployee.types";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { EMPLOYEE_TYPES } from "@/modules/employee/employee.types";
import { TRANSACTION_TYPES } from "../transaction/transaction.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { ATTRIBUTE_TYPES } from "@/modules/attribute/attribute.types";
import { BadRequestError, ForbiddenError } from "@/shared/types/errors";
import { TransactionService } from "../transaction/transaction.service";
import { AdvanceEmployeeRepository } from "./advanceEmployee.repository";
import { AttributeService } from "@/modules/attribute/attribute.service";
import { EmployeeRepository } from "@/modules/employee/employee.repository";
import { ApiResponse, IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { AdvanceEmployeeRelations, AdvanceEmployeeSelectFull } from "./advanceEmployee.select";
import { AdvanceEmployeeQueryDto, CreateAdvanceEmployeeDto, GetAdvanceEmployeeSummaryDto } from "./advanceEmployee.validator";
import { AttributeTypeEnum, ExpenseApprovalStatusEnum, FinanceTypeEnum } from "@/shared/constants/constance";

@injectable()
export class AdvanceEmployeeService extends BaseService<Finance> {
  protected relations = AdvanceEmployeeRelations;
  protected selectedFields = AdvanceEmployeeSelectFull;
  constructor(
    @inject(ADVANCE_EMPLOYEE_TYPES.AdvanceEmployeeRepository)
    private advanceEmployeeRepository: AdvanceEmployeeRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(COMMON_TYPES.CommonService) private commonService: CommonService,
    @inject(TRANSACTION_TYPES.TransactionService) private transactionService: TransactionService,
    @inject(ATTRIBUTE_TYPES.AttributeService) private attributeService: AttributeService,
    @inject(EMPLOYEE_TYPES.EmployeeRepository) private employeeRepository: EmployeeRepository,
  ) {
    super(advanceEmployeeRepository);
  }

  protected async attachMoreDataToSummary(summary: any, options: AdvanceEmployeeQueryDto): Promise<any> {
    const res = await this.advanceEmployeeRepository.getAllEmployeeAdvanceBalanceSummary(options);

    return {
      ...summary,
      ...res,
    };
  }

  async validateBeforeCreate(data: CreateAdvanceEmployeeDto, req: Request, manager?: IEntityManager): Promise<void> {
    // Add your validation logic here
    if (!data.code) {
      const code = await this.commonService.getCode("AdvanceEmployee", manager);
      data.code = code.data.code;
    } else {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.advanceEmployeeRepository.fieldExists("code", data.code, manager);
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

    if (data.employeeId && (data.type === FinanceTypeEnum.REIMBURSE || data.type === FinanceTypeEnum.SETTLEMENT)) {
      // kiểm tra số dư tạm ứng của nhân viên
      const advanceBalance = await this.advanceEmployeeRepository.getEmployeeAdvanceBalance(
        data.employeeId,
        data.timeAt,
        manager,
      );

      if (advanceBalance === 0) {
        throw new BadRequestError("Nhân viên chưa có phát sinh tạm ứng");
      }
    }
  }

  async actionAfterCreate(data: Finance, req?: Request, manager?: IEntityManager): Promise<void> {
    const attributeExist = await this.attributeService.checkExistNameAndType(
      data.category,
      AttributeTypeEnum.ADVANCE_EMPLOYEE,
      manager,
    );
    if (!attributeExist) {
      await this.attributeService.create(
        { name: data.category, type: AttributeTypeEnum.ADVANCE_EMPLOYEE },
        req,
        manager,
      );
    }
  }

  async validateBeforeUpdate(
    id: string,
    data: Partial<Finance>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const existingFinance = await this.advanceEmployeeRepository.findById(id, manager);
    if (!existingFinance) {
      throw new BadRequestError("Giao dịch không tồn tại");
    }
    if (data.code && data.code !== existingFinance.code) {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.advanceEmployeeRepository.fieldExists("code", data.code, manager);
      if (codeExists) {
        throw new BadRequestError("Mã giao dịch đã tồn tại");
      }
    }

    if (data.type === FinanceTypeEnum.ADVANCE_EMPLOYEE) {
      if (data.amount && data.amount !== existingFinance.amount) {
        // nếu phiếu đang trong trạng thái chờ duyệt hoặc đã duyệt thì không cho sửa số tiền
        if (
          existingFinance.status === ExpenseApprovalStatusEnum.PENDING ||
          existingFinance.status === ExpenseApprovalStatusEnum.APPROVED
        ) {
          throw new BadRequestError("Không thể sửa số tiền của phiếu đã được duyệt hoặc đang chờ duyệt");
        }
      }
    }
  }

  async actionAfterUpdate(data: Finance, req?: Request, manager?: IEntityManager): Promise<void> {
    if (data.type === FinanceTypeEnum.ADVANCE_EMPLOYEE || data.type === FinanceTypeEnum.REIMBURSE) {
      await this.transactionService.updateTransactionFromAdvanceEmployee(data, manager);

      const attributeExist = await this.attributeService.checkExistNameAndType(
        data.category,
        AttributeTypeEnum.ADVANCE_EMPLOYEE,
        manager,
      );

      if (!attributeExist) {
        await this.attributeService.create(
          { name: data.category, type: AttributeTypeEnum.ADVANCE_EMPLOYEE },
          req,
          manager,
        );
      }
    }
  }

  async actionAfterDelete(data: Finance, req?: Request, manager?: IEntityManager): Promise<void> {
    // Xoá giao dịch liên quan
    await this.transactionService.deleteTransactionFromAdvanceEmployee(data, manager);
  }

  async getAdvanceEmployeeSummary(
    data: GetAdvanceEmployeeSummaryDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<any>> {
    const result = await this.advanceEmployeeRepository.getAdvanceEmployeeSummary(data, req, manager);

    return ApiResponseHandler.getSuccess("OK", result.data, {
      totalRecords: result.total,
      currentPage: result.page,
      size: result.size,
      totalPages: Math.ceil(result.total / result.size),
    });
  }
}
